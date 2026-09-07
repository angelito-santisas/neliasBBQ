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
    @Test void invalidOrNonStaffTokenIsRejected() throws Exception {
        when(auth.verify("invalid")).thenThrow(new IllegalArgumentException());
        mvc.perform(get("/api/v1/staff/me").servletPath("/api/v1/staff/me").header("Authorization", "Bearer invalid")).andExpect(status().isForbidden());
    }
    @Test void verifiedStaffIsAllowed() throws Exception {
        when(auth.verify("valid")).thenReturn("staff-id");
        mvc.perform(get("/api/v1/staff/me").servletPath("/api/v1/staff/me").header("Authorization", "Bearer valid")).andExpect(status().isOk());
    }
}
