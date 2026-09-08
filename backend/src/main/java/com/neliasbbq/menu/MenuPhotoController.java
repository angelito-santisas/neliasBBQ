package com.neliasbbq.menu;

import java.util.UUID;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
public class MenuPhotoController {
    private final MenuPhotoService photos;
    public MenuPhotoController(MenuPhotoService photos) { this.photos = photos; }

    @GetMapping("/api/v1/menu/photos/{id}")
    public ResponseEntity<byte[]> get(@PathVariable UUID id) {
        var photo = photos.get(id);
        return ResponseEntity.ok().contentType(MediaType.parseMediaType(photo.contentType()))
            .cacheControl(CacheControl.noCache()).header("X-Content-Type-Options", "nosniff").body(photo.content());
    }
}
