package com.neliasbbq.menu;

import com.neliasbbq.common.ApiExceptionHandler;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class StaffMenuControllerTest {
    @Test void createsProductsAndRequiresCategory() throws Exception {
        var service = mock(MenuService.class);
        var mvc = MockMvcBuilders.standaloneSetup(new StaffMenuController(service)).setControllerAdvice(new ApiExceptionHandler()).build();
        String json = JSON.replace("\"version\":0", "\"category\":\"Classics\"");
        mvc.perform(post("/api/v1/staff/menu").contentType("application/json").content(json)).andExpect(status().isCreated());
        verify(service).create(argThat(item -> item.category().equals("Classics")), isNull());
        reset(service);
        var photo = new MockMultipartFile("photo", "dish.png", "image/png", new byte[]{1,2});
        mvc.perform(multipart("/api/v1/staff/menu").file(new MockMultipartFile("item", "", "application/json", json.getBytes())).file(photo))
            .andExpect(status().isCreated());
        verify(service).create(any(), eq(photo));
        reset(service);
        mvc.perform(post("/api/v1/staff/menu").contentType("application/json").content(json.replace("Classics", " ")))
            .andExpect(status().isBadRequest());
        verifyNoInteractions(service);
    }
    private static final String JSON = "{\"name\":\"Edited\",\"description\":\"Updated dish\",\"price\":25.50,\"active\":true,\"stockAvailable\":10,\"version\":0}";
    @Test void savesJsonAndMultipartAndRejectsInvalidCounts() throws Exception {
        var service = mock(MenuService.class);
        var mvc = MockMvcBuilders.standaloneSetup(new StaffMenuController(service)).setControllerAdvice(new ApiExceptionHandler()).build();
        mvc.perform(put("/api/v1/staff/menu/isaw").contentType("application/json").content(JSON)).andExpect(status().isOk());
        verify(service).update(eq("isaw"), argThat(item -> item.stockAvailable() == 10 && item.name().equals("Edited")), isNull());
        reset(service);
        var photo = new MockMultipartFile("photo", "dish.png", "image/png", new byte[]{1,2});
        mvc.perform(multipart(org.springframework.http.HttpMethod.PUT, "/api/v1/staff/menu/isaw")
            .file(new MockMultipartFile("item", "", "application/json", JSON.getBytes())).file(photo)).andExpect(status().isOk());
        verify(service).update(eq("isaw"), any(), eq(photo));
        reset(service);
        mvc.perform(put("/api/v1/staff/menu/isaw").contentType("application/json").content(JSON.replace("\"stockAvailable\":10", "\"stockAvailable\":-1")))
            .andExpect(status().isBadRequest());
        verifyNoInteractions(service);
    }
}
