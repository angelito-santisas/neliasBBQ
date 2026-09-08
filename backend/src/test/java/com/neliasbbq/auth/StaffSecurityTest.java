package com.neliasbbq.auth;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.test.context.junit.jupiter.web.SpringJUnitWebConfig;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;

@SpringJUnitWebConfig({StaffSecurityConfig.class, StaffSecurityTest.Config.class})
class StaffSecurityTest {
    @Configuration @EnableWebMvc @EnableWebSecurity
    static class Config {
        @Bean StaffAuthService auth() { return mock(StaffAuthService.class); }
        @Bean StaffAuthController controller(StaffAuthService auth) { return new StaffAuthController(auth); }
        @Bean com.neliasbbq.config.WebConfig cors() { return new com.neliasbbq.config.WebConfig("http://localhost:4200"); }
    }
    @Autowired WebApplicationContext context;
    @Autowired StaffAuthService auth;
    MockMvc mvc;
    @BeforeEach void setup() {
        reset(auth);
        mvc = MockMvcBuilders.webAppContextSetup(context).apply(springSecurity()).build();
    }
    @Test void anonymousIsRejected() throws Exception {
        mvc.perform(get("/api/v1/staff/me").servletPath("/api/v1/staff/me")).andExpect(status().isUnauthorized());
    }
    @Test void photosAndStaffMenuRequireAuthentication() throws Exception {
        for (String path : new String[]{"/api/v1/staff/photos/00000000-0000-0000-0000-000000000001", "/api/v1/staff/menu"}) {
            mvc.perform(get(path).servletPath(path)).andExpect(status().isUnauthorized());
        }
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart("/api/v1/staff/inventory")
            .servletPath("/api/v1/staff/inventory")).andExpect(status().isUnauthorized());
    }
    @Test void updatePreflightAllowsStaffAuthorizationHeader() throws Exception {
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options("/api/v1/staff/menu/isaw")
            .servletPath("/api/v1/staff/menu/isaw").header("Origin", "http://localhost:4200")
            .header("Access-Control-Request-Method", "PUT").header("Access-Control-Request-Headers", "authorization,content-type"))
            .andExpect(status().isOk());
    }
    @Test void menuEditingAndConfirmationRejectAnonymousRequests() throws Exception {
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post("/api/v1/staff/menu")
            .servletPath("/api/v1/staff/menu").contentType("application/json").content("{}"))
            .andExpect(status().isUnauthorized());
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put("/api/v1/staff/menu/isaw")
            .servletPath("/api/v1/staff/menu/isaw").contentType("application/json").content("{}"))
            .andExpect(status().isUnauthorized());
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post("/api/v1/staff/orders/00000000-0000-0000-0000-000000000001/confirm")
            .servletPath("/api/v1/staff/orders/00000000-0000-0000-0000-000000000001/confirm"))
            .andExpect(status().isUnauthorized());
    }
    @Test void invalidOrNonStaffTokenIsRejected() throws Exception {
        when(auth.verify("invalid")).thenThrow(new IllegalArgumentException());
        mvc.perform(get("/api/v1/staff/me").servletPath("/api/v1/staff/me").header("Authorization", "Bearer invalid")).andExpect(status().isForbidden());
    }
    @Test void verifiedStaffIsAllowed() throws Exception {
        when(auth.verify("valid")).thenReturn("staff-id");
        mvc.perform(get("/api/v1/staff/me").servletPath("/api/v1/staff/me").header("Authorization", "Bearer valid")).andExpect(status().isOk());
    }
}
