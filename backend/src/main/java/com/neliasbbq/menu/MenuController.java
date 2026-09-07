package com.neliasbbq.menu;

import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/menu")
public class MenuController {
    private final MenuService service;
    public MenuController(MenuService service) { this.service = service; }
    @GetMapping public List<MenuItemResponse> getMenu() { return service.getActiveMenu(); }
}
