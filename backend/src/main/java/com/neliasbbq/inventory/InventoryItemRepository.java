package com.neliasbbq.inventory;

import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface InventoryItemRepository extends JpaRepository<InventoryItem, UUID> {
    List<InventoryItem> findAllByActiveTrueOrderByCategoryAscNameAsc();
    boolean existsBySkuIgnoreCase(String sku);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select item from InventoryItem item where item.id = :id and item.active = true")
    Optional<InventoryItem> findActiveByIdForUpdate(@Param("id") UUID id);
}
