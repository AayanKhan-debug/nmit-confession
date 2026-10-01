package com.nmit.confessions.service;

import com.nmit.confessions.enums.ConfessionCategory;
import com.nmit.confessions.enums.ConfessionStatus;
import com.nmit.confessions.repository.ConfessionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DiscoveryServiceTest {

    @Mock
    private ConfessionRepository confessionRepository;

    @Mock
    private PublicConfessionService publicConfessionService;

    @InjectMocks
    private DiscoveryService discoveryService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(discoveryService, "discoveryTimezone", "Asia/Kolkata");
        ReflectionTestUtils.setField(discoveryService, "maxDateRangeDays", 31L);
    }

    @Test
    void testValidDateRange() {
        when(confessionRepository.findByStatusAndDateRange(any(), any(), any(), any()))
                .thenReturn(new PageImpl<>(Collections.emptyList()));

        discoveryService.discover("2026-10-01", "2026-10-05", null, 0, 20);

        verify(confessionRepository).findByStatusAndDateRange(
                eq(ConfessionStatus.PUBLISHED),
                any(Instant.class),
                any(Instant.class),
                any(Pageable.class)
        );
    }

    @Test
    void testInvalidDateFormat() {
        assertThrows(IllegalArgumentException.class, () ->
                discoveryService.discover("2026/10/01", "2026-10-05", null, 0, 20));
    }

    @Test
    void testFromGreaterThanOrEqualTo() {
        assertThrows(IllegalArgumentException.class, () ->
                discoveryService.discover("2026-10-05", "2026-10-01", null, 0, 20));
        assertThrows(IllegalArgumentException.class, () ->
                discoveryService.discover("2026-10-01", "2026-10-01", null, 0, 20));
    }

    @Test
    void testMaximumRangeExceeded() {
        assertThrows(IllegalArgumentException.class, () ->
                discoveryService.discover("2026-10-01", "2026-11-05", null, 0, 20));
    }

    @Test
    void testConfiguredTimezoneBehavior() {
        when(confessionRepository.findByStatusAndDateRange(any(), any(), any(), any()))
                .thenReturn(new PageImpl<>(Collections.emptyList()));

        discoveryService.discover("2026-10-01", "2026-10-02", null, 0, 20);

        Instant expectedStart = LocalDate.parse("2026-10-01").atStartOfDay(ZoneId.of("Asia/Kolkata")).toInstant();
        Instant expectedEnd = LocalDate.parse("2026-10-02").atStartOfDay(ZoneId.of("Asia/Kolkata")).toInstant();

        verify(confessionRepository).findByStatusAndDateRange(
                any(), eq(expectedStart), eq(expectedEnd), any());
    }

    @Test
    void testTodaysDateCalculation() {
        when(confessionRepository.findByStatusAndDateRange(any(), any(), any(), any()))
                .thenReturn(new PageImpl<>(Collections.emptyList()));

        discoveryService.discoverToday(null, 0, 20);

        LocalDate today = LocalDate.now(ZoneId.of("Asia/Kolkata"));
        Instant expectedStart = today.atStartOfDay(ZoneId.of("Asia/Kolkata")).toInstant();
        Instant expectedEnd = today.plusDays(1).atStartOfDay(ZoneId.of("Asia/Kolkata")).toInstant();

        verify(confessionRepository).findByStatusAndDateRange(
                any(), eq(expectedStart), eq(expectedEnd), any());
    }

    @Test
    void testCategoryFiltering() {
        when(confessionRepository.findByStatusAndCategoryAndDateRange(any(), any(), any(), any(), any()))
                .thenReturn(new PageImpl<>(Collections.emptyList()));

        discoveryService.discover("2026-10-01", "2026-10-05", ConfessionCategory.CRUSH, 0, 20);

        verify(confessionRepository).findByStatusAndCategoryAndDateRange(
                eq(ConfessionStatus.PUBLISHED),
                eq(ConfessionCategory.CRUSH),
                any(Instant.class),
                any(Instant.class),
                any(Pageable.class)
        );
    }

    @Test
    void testPaginationAndSizeLimit() {
        when(confessionRepository.findByStatusAndDateRange(any(), any(), any(), any()))
                .thenReturn(new PageImpl<>(Collections.emptyList()));

        assertThrows(IllegalArgumentException.class, () ->
                discoveryService.discover("2026-10-01", "2026-10-05", null, -1, 20));

        assertThrows(IllegalArgumentException.class, () ->
                discoveryService.discover("2026-10-01", "2026-10-05", null, 0, 0));

        assertThrows(IllegalArgumentException.class, () ->
                discoveryService.discover("2026-10-01", "2026-10-05", null, 0, 100));

        discoveryService.discover("2026-10-01", "2026-10-05", null, 2, 25);
        verify(confessionRepository).findByStatusAndDateRange(any(), any(), any(), argThat(pageable -> 
            pageable.getPageNumber() == 2 && pageable.getPageSize() == 25
        ));
    }
}
