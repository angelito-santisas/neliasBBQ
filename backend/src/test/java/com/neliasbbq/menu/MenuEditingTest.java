package com.neliasbbq.menu;

import com.neliasbbq.common.BadRequestException;
import java.math.BigDecimal;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class MenuEditingTest {
    @Test void rejectsStaleEditorBeforeChangingStockOrSavingPhoto() {
        var repository = mock(MenuItemRepository.class); var photos = mock(MenuPhotoService.class);
        var item = new MenuItem("dish", "Original", "BBQ", "Original", "image", BigDecimal.TEN, true);
        when(repository.findByIdForUpdate("dish")).thenReturn(Optional.of(item));
        var exception = assertThrows(ResponseStatusException.class, () -> new MenuService(repository, photos).update("dish",
            new UpdateMenuItemRequest("Edited", "Changed", BigDecimal.ONE, true, 5, 99L), null));
        assertEquals(409, exception.getStatusCode().value()); assertEquals("Original", item.getName());
        verifyNoInteractions(photos);
    }
    @Test void unavailableOrInsufficientStockCannotBeReserved() {
        var item = new MenuItem("dish", "Dish", "BBQ", "Description", "image", BigDecimal.TEN, true);
        assertThrows(BadRequestException.class, () -> item.reserve(1));
        item.update(new UpdateMenuItemRequest("Dish", "Description", BigDecimal.TEN, true, 2, 0L));
        assertThrows(BadRequestException.class, () -> item.reserve(3)); assertEquals(2, item.getStockAvailable());
        item.reserve(2); assertEquals(0, item.getStockAvailable());
        assertThrows(BadRequestException.class, () -> item.reserve(1));
    }
}
