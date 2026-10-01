package com.nmit.confessions.service;

import com.nmit.confessions.config.RateLimitConfig;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class RateLimitServiceTest {

    private RateLimitService rateLimitService;

    @BeforeEach
    void setUp() {
        RateLimitConfig config = new RateLimitConfig();
        config.setLimit(2);
        config.setWindowSeconds(3600);
        rateLimitService = new RateLimitService(config);
    }

    @Test
    void testIsAllowedLimitsProperly() {
        String ip = "192.168.1.1";

        assertThat(rateLimitService.isAllowed(ip)).isTrue();
        assertThat(rateLimitService.isAllowed(ip)).isTrue();
        assertThat(rateLimitService.isAllowed(ip)).isFalse();
    }
}
