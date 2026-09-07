package com.neliasbbq.menu;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MenuItemRepository extends JpaRepository<MenuItem, String> {
    List<MenuItem> findAllByActiveTrueOrderByCategoryAscNameAsc();
}
