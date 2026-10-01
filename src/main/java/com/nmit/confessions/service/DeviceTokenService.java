package com.nmit.confessions.service;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Service;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;

@Service
public class DeviceTokenService {

    private static final String COOKIE_NAME = "DEVICE_TOKEN";
    private final SecureRandom secureRandom = new SecureRandom();

    public String getOrCreateDeviceToken(HttpServletRequest request, HttpServletResponse response) {
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if (COOKIE_NAME.equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        
        byte[] randomBytes = new byte[32];
        secureRandom.nextBytes(randomBytes);
        String newToken = Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
        
        Cookie cookie = new Cookie(COOKIE_NAME, newToken);
        cookie.setHttpOnly(true);
        cookie.setSecure(request.isSecure());
        cookie.setPath("/");
        cookie.setMaxAge(31536000); // 1 year
        response.addCookie(cookie);
        
        return newToken;
    }

    public String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes());
            return Base64.getUrlEncoder().withoutPadding().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not found", e);
        }
    }
}
