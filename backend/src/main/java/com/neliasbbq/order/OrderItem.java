package com.neliasbbq.order;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "order_items")
public class OrderItem {
    @Id private UUID id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "order_id") private Order order;
    @Column(name = "menu_item_id") private String menuItemId;
    @Column(name = "item_name") private String itemName;
    @Column(name = "unit_price") private BigDecimal unitPrice;
    private int quantity;
    @Column(name = "line_total") private BigDecimal lineTotal;

    protected OrderItem() {}
    public OrderItem(String menuItemId, String itemName, BigDecimal unitPrice, int quantity) {
        this.id = UUID.randomUUID(); this.menuItemId = menuItemId; this.itemName = itemName;
        this.unitPrice = unitPrice; this.quantity = quantity; this.lineTotal = unitPrice.multiply(BigDecimal.valueOf(quantity));
    }
    void attachTo(Order order) { this.order = order; }
    public String getMenuItemId() { return menuItemId; }
    public String getItemName() { return itemName; }
    public BigDecimal getUnitPrice() { return unitPrice; }
    public int getQuantity() { return quantity; }
    public BigDecimal getLineTotal() { return lineTotal; }
}
