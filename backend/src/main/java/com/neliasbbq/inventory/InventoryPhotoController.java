package com.neliasbbq.inventory;

import java.util.UUID;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/staff/photos")
public class InventoryPhotoController {
    private final InventoryPhotoService photos;
    public InventoryPhotoController(InventoryPhotoService photos) { this.photos = photos; }

    @GetMapping("/{id}")
    public ResponseEntity<byte[]> get(@PathVariable UUID id) {
        var photo = photos.get(id);
        return ResponseEntity.ok().contentType(MediaType.parseMediaType(photo.contentType()))
            .cacheControl(CacheControl.noStore()).header("X-Content-Type-Options", "nosniff")
            .body(photo.content());
    }
}
