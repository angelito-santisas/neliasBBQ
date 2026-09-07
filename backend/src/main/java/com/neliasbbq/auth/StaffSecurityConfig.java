package com.neliasbbq.auth;

import java.util.List;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.filter.OncePerRequestFilter;

@Configuration
public class StaffSecurityConfig {
    @Bean
    SecurityFilterChain security(HttpSecurity http, StaffAuthService auth) throws Exception {
        // Stateless API: credentials travel only in explicit Authorization headers, never cookies.
        http.csrf(csrf -> csrf.disable()).cors(Customizer.withDefaults())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(rules -> rules
                .requestMatchers(HttpMethod.POST, "/api/v1/auth/login", "/api/v1/orders", "/api/v1/feedback").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/menu", "/actuator/health").permitAll()
                .requestMatchers("/api/v1/staff/**").hasRole("STAFF")
                .anyRequest().denyAll())
            .exceptionHandling(errors -> errors.authenticationEntryPoint((req, res, error) -> res.sendError(401)))
            .addFilterBefore(new OncePerRequestFilter() {
                @Override
                protected void doFilterInternal(jakarta.servlet.http.HttpServletRequest request, jakarta.servlet.http.HttpServletResponse response,
                        jakarta.servlet.FilterChain chain) throws java.io.IOException, jakarta.servlet.ServletException {
                    if (request.getServletPath().startsWith("/api/v1/staff/")) {
                        String header = request.getHeader("Authorization");
                        if (header == null || !header.startsWith("Bearer ")) { response.sendError(401); return; }
                        try {
                            String userId = auth.verify(header.substring(7));
                            SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(userId, null, List.of(new SimpleGrantedAuthority("ROLE_STAFF"))));
                        } catch (Exception ignored) { response.sendError(403); return; }
                    }
                    chain.doFilter(request, response);
                }
            }, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}
