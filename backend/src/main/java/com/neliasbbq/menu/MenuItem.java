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
    @Column(name = "photo_id") private java.util.UUID photoId;
    @Column(name = "stock_available") private Integer stockAvailable;
    @jakarta.persistence.Version private long version;

    protected MenuItem() {}
    public MenuItem(String id, String name, String category, String description, String imageUrl, BigDecimal price, boolean active) {
        this.id = id; this.name = name; this.category = category; this.description = description;
        this.imageUrl = imageUrl; this.price = price; this.active = active;
    }
    public String getId() { return id; }
    public java.util.UUID getPhotoId() { return photoId; }
    public Integer getStockAvailable() { return stockAvailable; }
    public long getVersion() { return version; }
    public void update(UpdateMenuItemRequest request) {
        name = request.name().trim(); description = request.description().trim(); price = request.price();
        active = request.active(); stockAvailable = request.stockAvailable();
        if (request.category() != null) category = request.category().trim();
    }
    public void setPhoto(java.util.UUID id) { photoId = id; imageUrl = "/api/v1/menu/photos/" + id; }
    public void reserve(int quantity) {
        checkStock(quantity);
        stockAvailable -= quantity;
    }
    public void checkStock(int quantity) {
        if (!active || stockAvailable == null || stockAvailable < quantity)
            throw new com.neliasbbq.common.BadRequestException(name + " does not have enough stock available.");
    }
    public String getName() { return name; }
    public String getCategory() { return category; }
    public String getDescription() { return description; }
    public String getImageUrl() { return imageUrl; }
    public BigDecimal getPrice() { return price; }
    public boolean isActive() { return active; }
}
