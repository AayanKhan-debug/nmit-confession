package com.nmit.confessions.service;

import com.nmit.confessions.enums.ConfessionCategory;
import com.nmit.confessions.repository.ConfessionRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.util.Collections;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TrendingServiceTest {

    @Mock
    private ConfessionRepository confessionRepository;

    @InjectMocks
    private TrendingService trendingService;

    @Test
    void testTrendingAllCategories() {
        ReflectionTestUtils.setField(trendingService, "windowDays", 7);

        when(confessionRepository.findTrendingConfessions(any(Instant.class), any(Instant.class), any(Pageable.class)))
                .thenReturn(new PageImpl<>(Collections.emptyList()));

        trendingService.getTrending(null, 0, 20);

        verify(confessionRepository).findTrendingConfessions(any(Instant.class), any(Instant.class), any(Pageable.class));
    }

    @Test
    void testTrendingWithCategory() {
        ReflectionTestUtils.setField(trendingService, "windowDays", 7);

        when(confessionRepository.findTrendingConfessionsByCategory(any(), any(Instant.class), any(Instant.class), any(Pageable.class)))
                .thenReturn(new PageImpl<>(Collections.emptyList()));

        trendingService.getTrending(ConfessionCategory.FUNNY, 0, 20);

        verify(confessionRepository).findTrendingConfessionsByCategory(eq(ConfessionCategory.FUNNY), any(Instant.class), any(Instant.class), any(Pageable.class));
    }

    @Test
    void testPaginationValidation() {
        assertThrows(IllegalArgumentException.class, () -> 
            trendingService.getTrending(null, -1, 20));

        assertThrows(IllegalArgumentException.class, () -> 
            trendingService.getTrending(null, 0, 0));

        assertThrows(IllegalArgumentException.class, () -> 
            trendingService.getTrending(null, 0, 100)); // > 50
    }
}
