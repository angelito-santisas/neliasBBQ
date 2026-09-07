package com.neliasbbq.auth;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.security.Principal;
import java.util.Map;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
public class StaffAuthController {
    private final StaffAuthService auth;
    public StaffAuthController(StaffAuthService auth) { this.auth = auth; }

    @PostMapping("/api/v1/auth/login")
    public ResponseEntity<StaffAuthService.LoginResponse> login(@Valid @RequestBody LoginRequest input) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(auth.login(input.email(), input.password()));
    }

    @GetMapping("/api/v1/staff/me")
    public ResponseEntity<Map<String, String>> me(Principal principal) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(Map.of("userId", principal.getName()));
    }

    public record LoginRequest(@NotBlank @Email @Size(max = 254) String email, @NotBlank @Size(max = 256) String password) {}
}
