package com.neliasbbq.inventory;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "inventory_movements")
public class InventoryMovement {
    @Id private UUID id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "inventory_item_id") private InventoryItem item;
    @Column(name = "movement_type") private String movementType;
    @Column(name = "quantity_delta") private BigDecimal quantityDelta;
    private String note;
    @Column(name = "created_by") private String createdBy;
    @Column(name = "created_at") private OffsetDateTime createdAt;

    protected InventoryMovement() {}

    public InventoryMovement(InventoryItem item, String movementType, BigDecimal quantityDelta, String note, String createdBy) {
        this.id = UUID.randomUUID();
        this.item = item;
        this.movementType = movementType;
        this.quantityDelta = quantityDelta;
        this.note = note;
        this.createdBy = createdBy;
        this.createdAt = OffsetDateTime.now();
    }
}
