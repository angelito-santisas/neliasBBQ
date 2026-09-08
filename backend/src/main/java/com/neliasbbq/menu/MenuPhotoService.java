package com.neliasbbq.menu;

import com.neliasbbq.common.PhotoUploadValidator;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@Service
public class MenuPhotoService {
    private final JdbcTemplate jdbc;
    public MenuPhotoService(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    public UUID save(MultipartFile file) {
        var photo = PhotoUploadValidator.validate(file);
        UUID id = UUID.randomUUID();
        jdbc.update("insert into menu_photos(id, content_type, content) values (?, ?, ?)", id, photo.contentType(), photo.content());
        return id;
    }

    public void delete(UUID id) {
        if (id != null) jdbc.update("delete from menu_photos where id = ?", id);
    }

    public PhotoUploadValidator.Photo get(UUID id) {
        return jdbc.query("select p.content_type, p.content from menu_photos p join menu_items m on m.photo_id = p.id where p.id = ?",
            (row, index) -> new PhotoUploadValidator.Photo(row.getString(1), row.getBytes(2)), id).stream().findFirst()
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }
}
