package com.neliasbbq.menu;

import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MenuService {
    private final MenuItemRepository repository;
    public MenuService(MenuItemRepository repository) { this.repository = repository; }

    @Transactional(readOnly = true)
    public List<MenuItemResponse> getActiveMenu() {
        return repository.findAllByActiveTrueOrderByCategoryAscNameAsc().stream().map(MenuItemResponse::from).toList();
    }
}
