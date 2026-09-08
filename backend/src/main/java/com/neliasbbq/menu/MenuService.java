package com.neliasbbq.menu;

import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MenuService {
    private final MenuItemRepository repository;
    private final MenuPhotoService photos;
    public MenuService(MenuItemRepository repository, MenuPhotoService photos) { this.repository = repository; this.photos = photos; }

    @Transactional(readOnly = true)
    public List<StaffMenuItemResponse> getStaffMenu() {
        return repository.findAll(org.springframework.data.domain.Sort.by("category", "name")).stream()
            .map(this::staffResponse).toList();
    }

    private StaffMenuItemResponse staffResponse(MenuItem item) {
        return new StaffMenuItemResponse(item.getId(), item.getName(), item.getCategory(), item.getDescription(),
            item.getImageUrl(), item.getPrice(), item.isActive(), item.getStockAvailable(), item.getVersion());
    }

    @Transactional
    public StaffMenuItemResponse create(CreateMenuItemRequest request, org.springframework.web.multipart.MultipartFile photo) {
        var item = new MenuItem(java.util.UUID.randomUUID().toString(), request.name().trim(), request.category().trim(),
            request.description().trim(), "/menu-placeholder.svg", request.price(), request.active());
        item.update(new UpdateMenuItemRequest(request.name(), request.description(), request.price(), request.active(),
            request.stockAvailable(), 0L, request.category()));
        if (photo != null) item.setPhoto(photos.save(photo));
        return staffResponse(repository.saveAndFlush(item));
    }

    @Transactional
    public StaffMenuItemResponse update(String id, UpdateMenuItemRequest request, org.springframework.web.multipart.MultipartFile photo) {
        MenuItem item = repository.findByIdForUpdate(id)
            .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND, "Menu item was not found."));
        if (item.getVersion() != request.version())
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.CONFLICT,
                "This item changed while you were editing. Close the editor, refresh the menu, and try again.");
        java.util.UUID oldPhoto = item.getPhotoId();
        item.update(request);
        if (photo != null) item.setPhoto(photos.save(photo));
        repository.flush();
        if (photo != null) photos.delete(oldPhoto);
        return staffResponse(item);
    }

    public record StaffMenuItemResponse(String id, String name, String category, String description,
        String imageUrl, java.math.BigDecimal price, boolean active, Integer stockAvailable, long version) {}

    @Transactional(readOnly = true)
    public List<MenuItemResponse> getActiveMenu() {
        return repository.findAllByActiveTrueOrderByCategoryAscNameAsc().stream().map(MenuItemResponse::from).toList();
    }
}
