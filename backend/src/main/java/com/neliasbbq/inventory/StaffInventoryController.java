package com.neliasbbq.inventory;

import jakarta.validation.Valid;
import java.security.Principal;
import java.util.List;
import java.util.UUID;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/staff/inventory")
public class StaffInventoryController {
    private final InventoryService service;
    public StaffInventoryController(InventoryService service) { this.service = service; }

    @GetMapping
    public List<InventoryItemResponse> getInventory() { return service.getInventory(); }

    @PostMapping(consumes = "application/json")
    public InventoryItemResponse create(@Valid @RequestBody CreateInventoryItemRequest request, Principal principal) {
        return service.create(request, principal.getName());
    }

    @PostMapping(consumes = "multipart/form-data")
    public InventoryItemResponse createWithPhoto(
            @Valid @org.springframework.web.bind.annotation.RequestPart("item") CreateInventoryItemRequest request,
            @org.springframework.web.bind.annotation.RequestPart(value = "photo", required = false)
                org.springframework.web.multipart.MultipartFile photo,
            Principal principal) {
        return service.create(request, principal.getName(), photo);
    }

    @PatchMapping("/{id}/stock")
    public InventoryItemResponse adjust(@PathVariable UUID id, @Valid @RequestBody AdjustInventoryRequest request, Principal principal) {
        return service.adjust(id, request, principal.getName());
    }
}
