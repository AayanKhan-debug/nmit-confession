package com.nmit.confessions.service;

import com.nmit.confessions.config.RateLimitConfig;
import org.springframework.stereotype.Service;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.Base64;
import java.util.Deque;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedDeque;

@Service
public class RateLimitService {

    private final RateLimitConfig config;
    private final ConcurrentHashMap<String, Deque<Instant>> requestLog = new ConcurrentHashMap<>();

    public RateLimitService(RateLimitConfig config) {
        this.config = config;
    }

    public boolean isAllowed(String ipAddress) {
        String ipHash = hashIp(ipAddress);
        Instant now = Instant.now();
        Instant windowStart = now.minusSeconds(config.getWindowSeconds());
        
        Deque<Instant> timestamps = requestLog.computeIfAbsent(ipHash, k -> new ConcurrentLinkedDeque<>());
        
        synchronized (timestamps) {
            while (!timestamps.isEmpty() && timestamps.peekFirst().isBefore(windowStart)) {
                timestamps.pollFirst();
            }
            
            if (timestamps.size() >= config.getLimit()) {
                return false;
            }
            
            timestamps.addLast(now);
            return true;
        }
    }

    private String hashIp(String ipAddress) {
        if (ipAddress == null || ipAddress.isEmpty()) ipAddress = "unknown";
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(ipAddress.getBytes());
            return Base64.getUrlEncoder().withoutPadding().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not found", e);
        }
    }
}
