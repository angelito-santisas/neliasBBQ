package com.neliasbbq.common;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import javax.imageio.ImageIO;
import org.springframework.web.multipart.MultipartFile;

public final class PhotoUploadValidator {
    public static final int MAX_BYTES = 2 * 1024 * 1024;
    private PhotoUploadValidator() {}

    public static Photo validate(MultipartFile file) {
        if (file.isEmpty() || file.getSize() > MAX_BYTES)
            throw new BadRequestException("Choose a JPG or PNG photo up to 2 MB.");
        try (var input = ImageIO.createImageInputStream(file.getInputStream())) {
            var readers = ImageIO.getImageReaders(input);
            if (!readers.hasNext()) throw new BadRequestException("The file is not a readable JPG or PNG photo.");
            var reader = readers.next();
            try {
                reader.setInput(input, true, true);
                String format = reader.getFormatName().toLowerCase(java.util.Locale.ROOT);
                if (!format.equals("jpeg") && !format.equals("png"))
                    throw new BadRequestException("Only JPG and PNG photos are supported.");
                int width = reader.getWidth(0), height = reader.getHeight(0);
                if (width < 1 || height < 1 || (long) width * height > 12_000_000)
                    throw new BadRequestException("Choose a photo no larger than 12 megapixels.");
                // Decode and re-encode to discard metadata and any appended file content.
                var decoded = reader.read(0);
                var output = new ByteArrayOutputStream();
                if (!ImageIO.write(decoded, format, output) || output.size() > MAX_BYTES)
                    throw new BadRequestException("The photo is too large. Resize it and try again.");
                return new Photo("image/" + format, output.toByteArray());
            } finally { reader.dispose(); }
        } catch (IOException | IllegalArgumentException exception) {
            throw new BadRequestException("The photo could not be read. Choose another JPG or PNG.");
        }
    }


    public record Photo(String contentType, byte[] content) {}
}
