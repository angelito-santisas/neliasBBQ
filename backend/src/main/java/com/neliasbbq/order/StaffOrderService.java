package com.neliasbbq.order;

import com.neliasbbq.common.BadRequestException;
import com.neliasbbq.menu.MenuItemRepository;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class StaffOrderService {
    private final OrderRepository orders;
    private final MenuItemRepository menu;
    public StaffOrderService(OrderRepository orders, MenuItemRepository menu) { this.orders = orders; this.menu = menu; }

    @Transactional(readOnly = true)
    public List<OrderResponse> pending() {
        return orders.findTop100ByStatusOrderByCreatedAtAsc("submitted").stream().map(OrderResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> pending(String number) {
        String query = number == null ? "" : number.trim().toLowerCase(java.util.Locale.ROOT);
        if (query.isEmpty()) return pending();
        if (!query.matches("[0-9a-f-]{1,36}")) return List.of();
        return orders.searchPending(query).stream().map(OrderResponse::from).toList();
    }

    @Transactional
    public OrderResponse cancel(UUID id, String staffId) {
        Order order = orders.findByIdForUpdate(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order was not found."));
        if ("cancelled".equals(order.getStatus())) return OrderResponse.from(order);
        if (!"submitted".equals(order.getStatus())) throw new BadRequestException("Only pending orders can be cancelled.");
        // Pending orders do not reserve stock. Share the confirmation lock so only one action wins.
        order.cancel(staffId);
        return OrderResponse.from(order);
    }

    @Transactional
    public OrderResponse confirm(UUID id, String staffId) {
        Order order = orders.findByIdForUpdate(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order was not found."));
        if ("confirmed".equals(order.getStatus())) return OrderResponse.from(order);
        if (!"submitted".equals(order.getStatus())) throw new BadRequestException("This order cannot be confirmed.");
        // Lock dishes in the same order for every order, preventing concurrent overselling and deadlocks.
        // All deductions roll back if any line is unavailable or the transaction fails.
        order.getItems().stream().sorted(Comparator.comparing(OrderItem::getMenuItemId)).forEach(line -> {
            var item = menu.findByIdForUpdate(line.getMenuItemId())
                .orElseThrow(() -> new BadRequestException("One of the ordered dishes is no longer available."));
            item.reserve(line.getQuantity());
        });
        order.confirm(staffId);
        return OrderResponse.from(order);
    }
}
