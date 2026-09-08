package com.neliasbbq.inventory;

import com.neliasbbq.common.BadRequestException;
import java.math.BigDecimal;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class InventoryService {
    private final InventoryItemRepository items;
    private final InventoryMovementRepository movements;
    private final InventoryPhotoService photos;

    public InventoryService(InventoryItemRepository items, InventoryMovementRepository movements, InventoryPhotoService photos) {
        this.items = items;
        this.movements = movements;
        this.photos = photos;
    }

    @Transactional(readOnly = true)
    public List<InventoryItemResponse> getInventory() {
        return items.findAllByActiveTrueOrderByCategoryAscNameAsc().stream().map(InventoryItemResponse::from).toList();
    }

    @Transactional
    public InventoryItemResponse create(CreateInventoryItemRequest request, String staffId) {
        return create(request, staffId, null);
    }

    @Transactional
    public InventoryItemResponse create(CreateInventoryItemRequest request, String staffId,
            org.springframework.web.multipart.MultipartFile photo) {
        String sku = request.sku().trim().toUpperCase(Locale.ROOT);
        if (items.existsBySkuIgnoreCase(sku)) throw new BadRequestException("An inventory item with that SKU already exists.");
        InventoryItem item = new InventoryItem(request.name().trim(), sku, request.category().trim(), request.unit().trim(),
            request.quantity(), request.reorderLevel(), request.unitCost());
        item.setPhotoId(photos.save(photo));
        item = items.save(item);
        if (request.quantity().signum() > 0) {
            movements.save(new InventoryMovement(item, "RECEIVED", request.quantity(), "Opening stock", staffId));
        }
        return InventoryItemResponse.from(item);
    }

    @Transactional
    public InventoryItemResponse adjust(UUID id, AdjustInventoryRequest request, String staffId) {
        InventoryItem item = items.findActiveByIdForUpdate(id)
            .orElseThrow(() -> new BadRequestException("Inventory item was not found."));
        BigDecimal delta = "USED".equals(request.movementType()) ? request.quantity().negate() : request.quantity();
        try {
            item.adjustStock(delta);
        } catch (IllegalArgumentException exception) {
            throw new BadRequestException(exception.getMessage());
        }
        String note = request.note() == null ? "" : request.note().trim();
        movements.save(new InventoryMovement(item, request.movementType(), delta, note, staffId));
        return InventoryItemResponse.from(item);
    }
}
