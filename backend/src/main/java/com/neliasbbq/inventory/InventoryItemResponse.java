package com.neliasbbq.inventory;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public record InventoryItemResponse(
    UUID id, String name, String sku, String category, String unit, BigDecimal quantity,
    BigDecimal reorderLevel, BigDecimal unitCost, String status, OffsetDateTime updatedAt
) {
    static InventoryItemResponse from(InventoryItem item) {
        String status = item.getQuantity().signum() == 0 ? "OUT_OF_STOCK"
            : item.getQuantity().compareTo(item.getReorderLevel()) <= 0 ? "LOW_STOCK" : "IN_STOCK";
        return new InventoryItemResponse(item.getId(), item.getName(), item.getSku(), item.getCategory(),
            item.getUnit(), item.getQuantity(), item.getReorderLevel(), item.getUnitCost(), status, item.getUpdatedAt());
    }
}
