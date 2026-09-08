package com.neliasbbq.menu;

import java.math.BigDecimal;

public record MenuItemResponse(String id, String name, String category, String description, String imageUrl, BigDecimal price, Integer stockAvailable) {
    static MenuItemResponse from(MenuItem item) {
        return new MenuItemResponse(item.getId(), item.getName(), item.getCategory(), item.getDescription(), item.getImageUrl(), item.getPrice(), item.getStockAvailable());
    }
}
