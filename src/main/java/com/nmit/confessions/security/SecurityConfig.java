package com.nmit.confessions.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Value("${app.cors.allowed-origins}")
    private String allowedOrigins;

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .headers(headers -> headers
                .frameOptions(frameOptions -> frameOptions.deny())
                .xssProtection(xss -> xss.disable())
                .contentSecurityPolicy(csp -> csp.policyDirectives("default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'"))
            )
            .csrf(csrf -> {
                CookieCsrfTokenRepository tokenRepository = CookieCsrfTokenRepository.withHttpOnlyFalse();
                tokenRepository.setCookieCustomizer(cookie -> cookie
                    .sameSite("None")
                    .secure(true)
                    .path("/")
                );
                org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler requestHandler = new org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler() {
                    @Override
                    public String resolveCsrfTokenValue(jakarta.servlet.http.HttpServletRequest request, org.springframework.security.web.csrf.CsrfToken csrfToken) {
                        String token = request.getHeader("X-XSRF-TOKEN");
                        if (token == null || token.isEmpty()) {
                            token = request.getHeader("X-CSRF-TOKEN");
                        }
                        if (token == null || token.isEmpty()) {
                            token = super.resolveCsrfTokenValue(request, csrfToken);
                        }
                        return token;
                    }
                };
                requestHandler.setCsrfRequestAttributeName(null);
                csrf.csrfTokenRepository(tokenRepository)
                    .csrfTokenRequestHandler(requestHandler)
                    .ignoringRequestMatchers("/api/auth/login", "/api/auth/logout", "/api/confessions", "/api/confessions/**", "/api/confessions/*/reports");
            })
            .addFilterAfter(new org.springframework.web.filter.OncePerRequestFilter() {
                @Override
                protected void doFilterInternal(jakarta.servlet.http.HttpServletRequest request, jakarta.servlet.http.HttpServletResponse response, jakarta.servlet.FilterChain filterChain) throws jakarta.servlet.ServletException, java.io.IOException {
                    org.springframework.security.web.csrf.CsrfToken csrfToken = (org.springframework.security.web.csrf.CsrfToken) request.getAttribute(org.springframework.security.web.csrf.CsrfToken.class.getName());
                    if (csrfToken != null) {
                        String token = csrfToken.getToken();
                        if (token != null && !token.isEmpty()) {
                            response.setHeader("X-XSRF-TOKEN", token);
                            response.setHeader("X-CSRF-TOKEN", token);
                        }
                    }
                    filterChain.doFilter(request, response);
                }
            }, org.springframework.security.web.authentication.www.BasicAuthenticationFilter.class)
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/api/auth/login").permitAll()
                .requestMatchers("/api/auth/logout").permitAll()
                .requestMatchers("/api/auth/csrf").permitAll()
                .requestMatchers("/api/confessions", "/api/confessions/**", "/api/confessions/*/reports").permitAll()
                .requestMatchers("/actuator/health").permitAll()
                .anyRequest().authenticated()
            )
            .exceptionHandling(e -> e
                .authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED))
            )
            .sessionManagement(session -> session
                .sessionFixation().migrateSession()
            )
            .logout(logout -> logout.disable());

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        List<String> origins = Arrays.stream(allowedOrigins.split(","))
            .map(String::trim)
            .filter(s -> !s.isEmpty())
            .toList();
        configuration.setAllowedOrigins(origins);
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Cache-Control", "Content-Type", "X-XSRF-TOKEN", "X-CSRF-TOKEN", "Accept", "Origin", "X-Requested-With"));
        configuration.setExposedHeaders(Arrays.asList("X-XSRF-TOKEN", "X-CSRF-TOKEN"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
