package com.neliasbbq.menu;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MenuItemRepository extends JpaRepository<MenuItem, String> {
    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("select item from MenuItem item where item.id = :id")
    java.util.Optional<MenuItem> findByIdForUpdate(@org.springframework.data.repository.query.Param("id") String id);
    List<MenuItem> findAllByActiveTrueOrderByCategoryAscNameAsc();
}
