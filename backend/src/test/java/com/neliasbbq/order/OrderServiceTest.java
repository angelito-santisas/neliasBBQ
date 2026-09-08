package com.neliasbbq.order;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.neliasbbq.menu.MenuItem;
import com.neliasbbq.menu.MenuItemRepository;
import java.math.BigDecimal;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.context.ApplicationEventPublisher;

class OrderServiceTest {
    @Test
    void calculatesPricesOnTheServer() throws Exception {
        MenuItem menuItem = new MenuItem("isaw", "Isaw ng Manok", "Offal", "Description", "image", new BigDecimal("180.00"), true);
        menuItem.update(new com.neliasbbq.menu.UpdateMenuItemRequest("Isaw ng Manok", "Description", new BigDecimal("180.00"), true, 10, 0L));
        MenuItemRepository menu = mock(MenuItemRepository.class);
        OrderRepository orders = mock(OrderRepository.class);
        ApplicationEventPublisher events = mock(ApplicationEventPublisher.class);
        when(menu.findByIdForUpdate("isaw")).thenReturn(java.util.Optional.of(menuItem));
        when(orders.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        OrderResponse response = new OrderService(menu, orders, events).create(new CreateOrderRequest(List.of(new CreateOrderRequest.Item("isaw", 2)), "Spicy"));

        assertEquals(new BigDecimal("360.00"), response.subtotal());
        assertEquals(new BigDecimal("410.00"), response.total());
        verify(events).publishEvent(any(OrderCreatedEvent.class));
        assertEquals(10, menuItem.getStockAvailable());
    }
}
