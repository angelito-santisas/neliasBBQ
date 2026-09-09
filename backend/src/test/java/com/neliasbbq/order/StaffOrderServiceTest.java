package com.neliasbbq.order;

import com.neliasbbq.common.BadRequestException;
import com.neliasbbq.menu.MenuItemRepository;
import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class StaffOrderServiceTest {
    private final OrderRepository orders = mock(OrderRepository.class);
    private final MenuItemRepository menu = mock(MenuItemRepository.class);
    private final StaffOrderService service = new StaffOrderService(orders, menu);

    @Test void searchesAllPendingOrdersUsingNormalizedNumber() {
        when(orders.searchPending("abc12345")).thenReturn(java.util.List.of(new Order(BigDecimal.TEN, BigDecimal.ZERO, "")));
        assertEquals(1, service.pending(" ABC12345 ").size());
        verify(orders).searchPending("abc12345");
        verify(orders, never()).findTop100ByStatusOrderByCreatedAtAsc(anyString());
        assertTrue(service.pending("%invalid").isEmpty());
        verifyNoMoreInteractions(orders);
    }

    @Test void cancellationKeepsStockAndOriginalAuditOnRetry() {
        var order = pending();
        assertEquals("cancelled", service.cancel(order.getId(), "staff-one").status());
        var timestamp = order.getCancelledAt();
        assertNotNull(timestamp);
        assertEquals("cancelled", service.cancel(order.getId(), "staff-two").status());
        assertEquals("staff-one", order.getCancelledBy());
        assertEquals(timestamp, order.getCancelledAt());
        verify(orders, times(2)).findByIdForUpdate(order.getId());
        verifyNoInteractions(menu);
    }

    @Test void cancelledOrdersCannotBeConfirmed() {
        var order = pending();
        service.cancel(order.getId(), "staff");
        assertThrows(BadRequestException.class, () -> service.confirm(order.getId(), "staff"));
        assertEquals("cancelled", order.getStatus());
        verifyNoInteractions(menu);
    }

    @Test void confirmedOrdersCannotBeCancelled() {
        var order = pending();
        order.confirm("staff");
        assertThrows(BadRequestException.class, () -> service.cancel(order.getId(), "staff"));
        assertEquals("confirmed", order.getStatus());
        assertNull(order.getCancelledAt());
        verifyNoInteractions(menu);
    }

    @Test void missingOrderReturnsNotFound() {
        var error = assertThrows(ResponseStatusException.class, () -> service.cancel(UUID.randomUUID(), "staff"));
        assertEquals(404, error.getStatusCode().value());
        verifyNoInteractions(menu);
    }

    private Order pending() {
        var order = new Order(BigDecimal.TEN, BigDecimal.ZERO, "");
        when(orders.findByIdForUpdate(order.getId())).thenReturn(Optional.of(order));
        return order;
    }
}
