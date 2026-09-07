package com.neliasbbq.order;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record OrderResponse(UUID id, List<Line> items, BigDecimal subtotal, BigDecimal serviceFee, BigDecimal total, String status, OffsetDateTime createdAt) {
    public record Line(String menuItemId, String name, BigDecimal unitPrice, int quantity, BigDecimal lineTotal) {}
    public static OrderResponse from(Order order) {
        return new OrderResponse(order.getId(), order.getItems().stream().map(item -> new Line(item.getMenuItemId(), item.getItemName(), item.getUnitPrice(), item.getQuantity(), item.getLineTotal())).toList(), order.getSubtotal(), order.getServiceFee(), order.getTotal(), order.getStatus(), order.getCreatedAt());
    }
}
