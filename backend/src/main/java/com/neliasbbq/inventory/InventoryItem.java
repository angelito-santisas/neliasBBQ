package com.neliasbbq.inventory;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "inventory_items")
public class InventoryItem {
    @Id private UUID id;
    private String name;
    private String sku;
    private String category;
    private String unit;
    private BigDecimal quantity;
    @Column(name = "reorder_level") private BigDecimal reorderLevel;
    @Column(name = "unit_cost") private BigDecimal unitCost;
    private boolean active;
    @Column(name = "updated_at") private OffsetDateTime updatedAt;

    protected InventoryItem() {}

    public InventoryItem(String name, String sku, String category, String unit, BigDecimal quantity,
            BigDecimal reorderLevel, BigDecimal unitCost) {
        this.id = UUID.randomUUID();
        this.name = name;
        this.sku = sku;
        this.category = category;
        this.unit = unit;
        this.quantity = quantity;
        this.reorderLevel = reorderLevel;
        this.unitCost = unitCost;
        this.active = true;
        this.updatedAt = OffsetDateTime.now();
    }

    public void adjustStock(BigDecimal delta) {
        BigDecimal newQuantity = quantity.add(delta);
        if (newQuantity.signum() < 0) throw new IllegalArgumentException("Stock on hand cannot be negative.");
        quantity = newQuantity;
        updatedAt = OffsetDateTime.now();
    }

    public UUID getId() { return id; }
    public String getName() { return name; }
    public String getSku() { return sku; }
    public String getCategory() { return category; }
    public String getUnit() { return unit; }
    public BigDecimal getQuantity() { return quantity; }
    public BigDecimal getReorderLevel() { return reorderLevel; }
    public BigDecimal getUnitCost() { return unitCost; }
    public boolean isActive() { return active; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
}
