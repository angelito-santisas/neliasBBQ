package com.neliasbbq.inventory;

import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@Service
public class InventoryPhotoService {
    static final int MAX_BYTES = com.neliasbbq.common.PhotoUploadValidator.MAX_BYTES;
    private final JdbcTemplate jdbc;

    public InventoryPhotoService(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    // Called within the inventory creation transaction, so a failed item never leaves a photo behind.
    public UUID save(MultipartFile file) {
        if (file == null) return null;
        Photo photo = validate(file);
        UUID id = UUID.randomUUID();
        jdbc.update("insert into inventory_photos(id, content_type, content) values (?, ?, ?)",
            id, photo.contentType(), photo.content());
        return id;
    }

    static Photo validate(MultipartFile file) {
        var photo = com.neliasbbq.common.PhotoUploadValidator.validate(file);
        return new Photo(photo.contentType(), photo.content());
    }
    public Photo get(UUID id) {
        return jdbc.query("select content_type, content from inventory_photos where id = ?",
            (row, index) -> new Photo(row.getString(1), row.getBytes(2)), id).stream().findFirst()
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

    public record Photo(String contentType, byte[] content) {}
}
