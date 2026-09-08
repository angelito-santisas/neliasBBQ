package com.neliasbbq.menu;

import com.neliasbbq.order.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import javax.imageio.ImageIO;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.transaction.annotation.Transactional;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
@EnabledIfEnvironmentVariable(named = "SUPABASE_INTEGRATION_TESTS", matches = "true")
class MenuEditingIntegrationTest {
    @Autowired MenuItemRepository items;
    @Autowired MenuService menu;
    @Autowired MenuPhotoService photos;
    @Autowired OrderService checkout;
    @Autowired StaffOrderService staff;
    @Autowired org.springframework.jdbc.core.JdbcTemplate jdbc;

    @Test void createsProductAndChangesCategoryWithoutReplacingPicture() throws Exception {
        var output = new ByteArrayOutputStream();
        ImageIO.write(new BufferedImage(3, 2, BufferedImage.TYPE_INT_RGB), "png", output);
        var created = menu.create(new CreateMenuItemRequest("QA new product", "Classics", "Test description", BigDecimal.TEN, true, 12),
            new MockMultipartFile("photo", "dish.png", "image/png", output.toByteArray()));
        assertNotNull(created.id()); assertEquals(12, created.stockAvailable()); assertEquals("Classics", created.category());
        assertTrue(created.imageUrl().startsWith("/api/v1/menu/photos/"));
        assertTrue(menu.getActiveMenu().stream().anyMatch(item -> item.id().equals(created.id())));
        var updated = menu.update(created.id(), new UpdateMenuItemRequest(created.name(), created.description(), created.price(), true, 12, created.version(), "Offal Delights"), null);
        assertEquals("Offal Delights", updated.category()); assertEquals(created.imageUrl(), updated.imageUrl());
        var withoutPhoto = menu.create(new CreateMenuItemRequest("QA without photo", "Drinks", "Test drink", BigDecimal.ONE, false, 0), null);
        assertEquals("/menu-placeholder.svg", withoutPhoto.imageUrl());
        assertFalse(menu.getActiveMenu().stream().anyMatch(item -> item.id().equals(withoutPhoto.id())));
    }

    @Test void editsAndPublishesPictureAndDeductsOnlyOnceOnConfirmation() throws Exception {
        String id = "qa-" + UUID.randomUUID();
        var original = items.saveAndFlush(new MenuItem(id, "Before", "Test", "Before description", "https://example.com/before.jpg", BigDecimal.TEN, true));
        var output = new ByteArrayOutputStream();
        ImageIO.write(new BufferedImage(3, 2, BufferedImage.TYPE_INT_RGB), "png", output);
        var updated = menu.update(id, new UpdateMenuItemRequest("Edited title", "Edited description", new BigDecimal("25.50"), true, 7, original.getVersion()),
            new MockMultipartFile("photo", "dish.png", "image/png", output.toByteArray()));
        assertEquals("Edited title", updated.name()); assertEquals("Edited description", updated.description());
        assertEquals(new BigDecimal("25.50"), updated.price()); assertEquals(7, updated.stockAvailable());
        assertTrue(updated.imageUrl().startsWith("/api/v1/menu/photos/"));
        var photoId = UUID.fromString(updated.imageUrl().substring(updated.imageUrl().lastIndexOf('/') + 1));
        assertEquals("image/png", photos.get(photoId).contentType());
        assertTrue(menu.getActiveMenu().stream().anyMatch(item -> item.id().equals(id) && item.stockAvailable() == 7));
        var order = checkout.create(new CreateOrderRequest(List.of(new CreateOrderRequest.Item(id, 3)), ""));
        items.flush();
        assertEquals(7, items.findById(id).orElseThrow().getStockAvailable());
        assertEquals("submitted", order.status());
        assertEquals("confirmed", staff.confirm(order.id(), "integration-test-staff").status());
        items.flush();
        assertEquals(4, items.findById(id).orElseThrow().getStockAvailable());
        staff.confirm(order.id(), "integration-test-staff");
        items.flush();
        assertEquals(4, items.findById(id).orElseThrow().getStockAvailable());
        assertEquals("integration-test-staff", jdbc.queryForObject("select confirmed_by from orders where id=?", String.class, order.id()));
    }
}
