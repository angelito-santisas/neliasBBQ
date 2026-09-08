package com.neliasbbq.inventory;

import com.neliasbbq.common.BadRequestException;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import javax.imageio.ImageIO;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;
import static org.junit.jupiter.api.Assertions.*;

class InventoryPhotoServiceTest {
    private byte[] image(String format, int width, int height) throws Exception {
        var output = new ByteArrayOutputStream();
        ImageIO.write(new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB), format, output);
        return output.toByteArray();
    }

    @Test void acceptsPngAndJpegBasedOnContentInsteadOfFilename() throws Exception {
        for (String format : new String[]{"png", "jpeg"}) {
            var result = InventoryPhotoService.validate(new MockMultipartFile("photo", "wrong.txt", "text/plain", image(format, 2, 2)));
            assertEquals("image/" + format, result.contentType());
            assertNotNull(ImageIO.read(new java.io.ByteArrayInputStream(result.content())));
        }
    }

    @Test void stripsAppendedPayload() throws Exception {
        var bytes = new ByteArrayOutputStream();
        bytes.write(image("png", 2, 2));
        bytes.write("<script>unexpected-content</script>".getBytes());
        var result = InventoryPhotoService.validate(new MockMultipartFile("photo", bytes.toByteArray()));
        assertFalse(new String(result.content(), java.nio.charset.StandardCharsets.ISO_8859_1).contains("unexpected-content"));
    }

    @Test void rejectsSvgPretendingToBePng() {
        assertThrows(BadRequestException.class, () -> InventoryPhotoService.validate(
            new MockMultipartFile("photo", "photo.png", "image/png", "<svg onload='alert(1)'/>".getBytes())));
    }

    @Test void rejectsEmptyAndOversizedFiles() {
        assertThrows(BadRequestException.class, () -> InventoryPhotoService.validate(new MockMultipartFile("photo", new byte[0])));
        assertThrows(BadRequestException.class, () -> InventoryPhotoService.validate(new MockMultipartFile("photo", new byte[InventoryPhotoService.MAX_BYTES + 1])));
    }

    @Test void rejectsExcessiveDimensionsBeforeDecodingPixels() throws Exception {
        byte[] bytes = image("png", 4000, 3001);
        assertThrows(BadRequestException.class, () -> InventoryPhotoService.validate(new MockMultipartFile("photo", bytes)));
    }
}
