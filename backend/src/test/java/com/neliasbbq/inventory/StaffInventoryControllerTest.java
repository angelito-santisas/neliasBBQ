package com.neliasbbq.inventory;

import com.neliasbbq.common.ApiExceptionHandler;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class StaffInventoryControllerTest {
    @Test void bindsMultipartJsonAndPhotoAndValidatesItem() throws Exception {
        var service = mock(InventoryService.class);
        var mvc = MockMvcBuilders.standaloneSetup(new StaffInventoryController(service))
            .setControllerAdvice(new ApiExceptionHandler()).build();
        var photo = new MockMultipartFile("photo", "rice.png", "image/png", new byte[]{1, 2});
        var json = new MockMultipartFile("item", "", "application/json",
            "{\"name\":\"Rice\",\"sku\":\"RICE\",\"category\":\"Grains\",\"unit\":\"kg\",\"quantity\":1,\"reorderLevel\":0,\"unitCost\":50}".getBytes());
        mvc.perform(multipart("/api/v1/staff/inventory").file(json).file(photo).principal(() -> "staff-id"))
            .andExpect(status().isOk());
        verify(service).create(argThat(item -> item.name().equals("Rice")), eq("staff-id"), eq(photo));
        reset(service);
        mvc.perform(multipart("/api/v1/staff/inventory")
            .file(new MockMultipartFile("item", "", "application/json", "{}".getBytes())).file(photo).principal(() -> "staff-id"))
            .andExpect(status().isBadRequest());
        verifyNoInteractions(service);
    }
}
