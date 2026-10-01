package com.nmit.confessions.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Iterator;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class ReportRateLimitService {

    private final Map<String, TokenRecord> requestCounts = new ConcurrentHashMap<>();

    @Value("${app.report.rate-limit:20}")
    private int limit;

    @Value("${app.report.rate-window-seconds:3600}")
    private long windowSeconds;

    public boolean isAllowed(String tokenHash) {
        cleanup();
        Instant now = Instant.now();
        
        TokenRecord record = requestCounts.computeIfAbsent(tokenHash, k -> new TokenRecord(now));
        
        if (now.isAfter(record.startTime.plusSeconds(windowSeconds))) {
            record.startTime = now;
            record.count.set(1);
            return true;
        }

        if (record.count.incrementAndGet() > limit) {
            return false;
        }

        return true;
    }

    private void cleanup() {
        Instant now = Instant.now();
        requestCounts.entrySet().removeIf(entry -> 
            now.isAfter(entry.getValue().startTime.plusSeconds(windowSeconds))
        );
    }

    private static class TokenRecord {
        Instant startTime;
        AtomicInteger count;

        TokenRecord(Instant startTime) {
            this.startTime = startTime;
            this.count = new AtomicInteger(0);
        }
    }
}
