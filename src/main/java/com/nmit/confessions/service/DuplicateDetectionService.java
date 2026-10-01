package com.nmit.confessions.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.Base64;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class DuplicateDetectionService {

    private final ConcurrentHashMap<String, Instant> hashExpirations = new ConcurrentHashMap<>();
    
    @Value("${app.duplicate-detection.window-seconds:3600}")
    private long windowSeconds;

    public boolean isDuplicate(String content) {
        String normalized = normalize(content);
        String hash = hashString(normalized);
        cleanExpired();
        
        Instant expiry = hashExpirations.get(hash);
        if (expiry != null && expiry.isAfter(Instant.now())) {
            return true;
        }
        
        hashExpirations.put(hash, Instant.now().plusSeconds(windowSeconds));
        return false;
    }

    private String normalize(String content) {
        if (content == null) return "";
        return content.toLowerCase()
                .replaceAll("\\p{Punct}", "")
                .replaceAll("\\s+", " ")
                .trim();
    }

    private String hashString(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes());
            return Base64.getUrlEncoder().withoutPadding().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not found", e);
        }
    }

    private void cleanExpired() {
        Instant now = Instant.now();
        hashExpirations.entrySet().removeIf(entry -> entry.getValue().isBefore(now));
    }
}
