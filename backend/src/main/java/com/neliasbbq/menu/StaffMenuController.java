package com.neliasbbq.menu;

import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class StaffMenuController {
    private final MenuService menu;
    public StaffMenuController(MenuService menu) { this.menu = menu; }
    @GetMapping("/api/v1/staff/menu")
    public List<MenuService.StaffMenuItemResponse> getMenu() { return menu.getStaffMenu(); }

    @org.springframework.web.bind.annotation.PostMapping(value = "/api/v1/staff/menu", consumes = "application/json")
    @org.springframework.web.bind.annotation.ResponseStatus(org.springframework.http.HttpStatus.CREATED)
    public MenuService.StaffMenuItemResponse create(
            @jakarta.validation.Valid @org.springframework.web.bind.annotation.RequestBody CreateMenuItemRequest request) {
        return menu.create(request, null);
    }

    @org.springframework.web.bind.annotation.PostMapping(value = "/api/v1/staff/menu", consumes = "multipart/form-data")
    @org.springframework.web.bind.annotation.ResponseStatus(org.springframework.http.HttpStatus.CREATED)
    public MenuService.StaffMenuItemResponse createWithPhoto(
            @jakarta.validation.Valid @org.springframework.web.bind.annotation.RequestPart("item") CreateMenuItemRequest request,
            @org.springframework.web.bind.annotation.RequestPart("photo") org.springframework.web.multipart.MultipartFile photo) {
        return menu.create(request, photo);
    }

    @org.springframework.web.bind.annotation.PutMapping(value = "/api/v1/staff/menu/{id}", consumes = "application/json")
    public MenuService.StaffMenuItemResponse update(@org.springframework.web.bind.annotation.PathVariable String id,
            @jakarta.validation.Valid @org.springframework.web.bind.annotation.RequestBody UpdateMenuItemRequest request) {
        return menu.update(id, request, null);
    }

    @org.springframework.web.bind.annotation.PutMapping(value = "/api/v1/staff/menu/{id}", consumes = "multipart/form-data")
    public MenuService.StaffMenuItemResponse updateWithPhoto(@org.springframework.web.bind.annotation.PathVariable String id,
            @jakarta.validation.Valid @org.springframework.web.bind.annotation.RequestPart("item") UpdateMenuItemRequest request,
            @org.springframework.web.bind.annotation.RequestPart("photo") org.springframework.web.multipart.MultipartFile photo) {
        return menu.update(id, request, photo);
    }
}
