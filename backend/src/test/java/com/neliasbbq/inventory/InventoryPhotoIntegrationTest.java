package com.neliasbbq.inventory;

import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.util.UUID;
import javax.imageio.ImageIO;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.transaction.annotation.Transactional;
import static org.junit.jupiter.api.Assertions.*;

// Explicit opt-in: uses the configured Supabase database and rolls test data back.
@SpringBootTest
@Transactional
@EnabledIfEnvironmentVariable(named = "SUPABASE_INTEGRATION_TESTS", matches = "true")
class InventoryPhotoIntegrationTest {
    @Autowired InventoryService inventory;
    @Autowired InventoryPhotoService photos;
    @Autowired JdbcTemplate jdbc;
    @Autowired jakarta.persistence.EntityManager entityManager;
    @Autowired com.neliasbbq.menu.MenuService menu;

    @Test void savesAndReadsPhotoAlongsideInventoryWithoutChangingMenu() throws Exception {
        Integer menuCount = jdbc.queryForObject("select count(*) from menu_items", Integer.class);
        var output = new ByteArrayOutputStream();
        ImageIO.write(new BufferedImage(4, 3, BufferedImage.TYPE_INT_RGB), "png", output);
        var file = new MockMultipartFile("photo", "test.png", "image/png", output.toByteArray());
        var request = new CreateInventoryItemRequest("Photo integration test", "QA-" + UUID.randomUUID(), "Test", "kg",
            BigDecimal.ONE, BigDecimal.ZERO, BigDecimal.TEN);
        var item = inventory.create(request, "automated-transaction-rollback", file);
        entityManager.flush();
        assertNotNull(item.imageUrl());
        UUID photoId = UUID.fromString(item.imageUrl().substring(item.imageUrl().lastIndexOf('/') + 1));
        var persisted = photos.get(photoId);
        assertEquals("image/png", persisted.contentType());
        var decoded = ImageIO.read(new java.io.ByteArrayInputStream(persisted.content()));
        assertEquals(4, decoded.getWidth()); assertEquals(3, decoded.getHeight());
        assertEquals(photoId, jdbc.queryForObject("select photo_id from inventory_items where id = ?", UUID.class, item.id()));
        assertEquals(1, jdbc.queryForObject("select count(*) from inventory_movements where inventory_item_id = ?", Integer.class, item.id()));
        assertEquals(menuCount, jdbc.queryForObject("select count(*) from menu_items", Integer.class));
        assertEquals(menuCount, menu.getStaffMenu().size());
    }
}
