package com.neliasbbq.order;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "orders")
public class Order {
    @Id private UUID id;
    private BigDecimal subtotal;
    @Column(name = "service_fee") private BigDecimal serviceFee;
    private BigDecimal total;
    @Column(name = "special_instructions") private String specialInstructions;
    private String status;
    @Column(name = "created_at") private OffsetDateTime createdAt;
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items = new ArrayList<>();

    protected Order() {}
    public Order(BigDecimal subtotal, BigDecimal serviceFee, String specialInstructions) {
        this.id = UUID.randomUUID(); this.subtotal = subtotal; this.serviceFee = serviceFee;
        this.total = subtotal.add(serviceFee); this.specialInstructions = specialInstructions;
        this.status = "submitted"; this.createdAt = OffsetDateTime.now();
    }
    public void addItem(OrderItem item) { items.add(item); item.attachTo(this); }
    public UUID getId() { return id; }
    public BigDecimal getSubtotal() { return subtotal; }
    public BigDecimal getServiceFee() { return serviceFee; }
    public BigDecimal getTotal() { return total; }
    public String getStatus() { return status; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public List<OrderItem> getItems() { return List.copyOf(items); }
}
