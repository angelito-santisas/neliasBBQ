package com.neliasbbq.auth;

import java.time.Duration;
import java.util.Arrays;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

@Service
public class StaffAuthService {
    private final RestClient client;
    private final Set<String> staffIds;

    public StaffAuthService(@Value("${SUPABASE_URL:https://unconfigured.invalid}") String url,
            @Value("${SUPABASE_PUBLISHABLE_KEY:}") String key,
            @Value("${STAFF_USER_IDS:}") String ids) {
        var factory = new JdkClientHttpRequestFactory(java.net.http.HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build());
        factory.setReadTimeout(Duration.ofSeconds(5));
        client = RestClient.builder().baseUrl(url + "/auth/v1").defaultHeader("apikey", key).requestFactory(factory).build();
        staffIds = Arrays.stream(ids.split(",")).map(String::trim).filter(id -> !id.isEmpty()).collect(Collectors.toUnmodifiableSet());
    }

    public String verify(String token) {
        if (staffIds.isEmpty()) throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        try {
            var user = client.get().uri("/user").headers(headers -> headers.setBearerAuth(token)).retrieve().body(Map.class);
            if (user != null && user.get("id") instanceof String id && staffIds.contains(id)) return id;
        } catch (Exception ignored) { /* Fail closed; never log tokens or provider payloads. */ }
        throw new ResponseStatusException(HttpStatus.FORBIDDEN);
    }

    public LoginResponse login(String email, String password) {
        try {
            var result = client.post().uri("/token?grant_type=password").contentType(MediaType.APPLICATION_JSON)
                .body(Map.of("email", email, "password", password)).retrieve().body(Map.class);
            if (result == null || !(result.get("access_token") instanceof String token)) throw new IllegalStateException();
            String id = verify(token);
            return new LoginResponse(token, id);
        } catch (Exception ignored) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unable to sign in with a staff account.");
        }
    }

    public record LoginResponse(String accessToken, String userId) {}
}
