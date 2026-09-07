package com.neliasbbq.menu;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;

@Entity
@Table(name = "menu_items")
public class MenuItem {
    @Id private String id;
    private String name;
    private String category;
    private String description;
    @Column(name = "image_url") private String imageUrl;
    private BigDecimal price;
    private boolean active;

    protected MenuItem() {}
    public MenuItem(String id, String name, String category, String description, String imageUrl, BigDecimal price, boolean active) {
        this.id = id; this.name = name; this.category = category; this.description = description;
        this.imageUrl = imageUrl; this.price = price; this.active = active;
    }
    public String getId() { return id; }
    public String getName() { return name; }
    public String getCategory() { return category; }
    public String getDescription() { return description; }
    public String getImageUrl() { return imageUrl; }
    public BigDecimal getPrice() { return price; }
    public boolean isActive() { return active; }
}
