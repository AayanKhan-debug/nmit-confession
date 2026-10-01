package com.nmit.confessions.service;

import com.nmit.confessions.enums.ConfessionCategory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.ZoneId;
import java.time.temporal.IsoFields;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ArchiveServiceTest {

    @Mock
    private DiscoveryService discoveryService;

    @InjectMocks
    private ArchiveService archiveService;

    private ZoneId zoneId;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(archiveService, "discoveryTimezone", "Asia/Kolkata");
        zoneId = ZoneId.of("Asia/Kolkata");
    }

    @Test
    void testDailyArchiveFutureDate() {
        LocalDate tomorrow = LocalDate.now(zoneId).plusDays(1);
        assertThrows(IllegalArgumentException.class, () ->
                archiveService.getDailyArchive(tomorrow.toString(), null, 0, 20));
    }

    @Test
    void testDailyArchiveToday() {
        LocalDate today = LocalDate.now(zoneId);
        archiveService.getDailyArchive(today.toString(), ConfessionCategory.CRUSH, 0, 20);
        verify(discoveryService).discover(today.toString(), today.plusDays(1).toString(), ConfessionCategory.CRUSH, 0, 20);
    }

    @Test
    void testDailyArchiveYesterday() {
        LocalDate yesterday = LocalDate.now(zoneId).minusDays(1);
        archiveService.getDailyArchive(yesterday.toString(), ConfessionCategory.FUNNY, 1, 10);
        verify(discoveryService).discover(yesterday.toString(), yesterday.plusDays(1).toString(), ConfessionCategory.FUNNY, 1, 10);
    }

    @Test
    void testWeeklyArchiveFutureWeek() {
        LocalDate nextWeek = LocalDate.now(zoneId).plusWeeks(1);
        int year = nextWeek.get(IsoFields.WEEK_BASED_YEAR);
        int week = nextWeek.get(IsoFields.WEEK_OF_WEEK_BASED_YEAR);
        assertThrows(IllegalArgumentException.class, () ->
                archiveService.getWeeklyArchive(year, week, null, 0, 20));
    }

    @Test
    void testWeeklyArchiveCurrentWeek() {
        LocalDate today = LocalDate.now(zoneId);
        int year = today.get(IsoFields.WEEK_BASED_YEAR);
        int week = today.get(IsoFields.WEEK_OF_WEEK_BASED_YEAR);
        
        archiveService.getWeeklyArchive(year, week, null, 0, 20);
        
        LocalDate monday = today.with(java.time.DayOfWeek.MONDAY);
        verify(discoveryService).discover(monday.toString(), monday.plusWeeks(1).toString(), null, 0, 20);
    }

    @Test
    void testWeeklyArchivePreviousWeek() {
        LocalDate lastWeek = LocalDate.now(zoneId).minusWeeks(1);
        int year = lastWeek.get(IsoFields.WEEK_BASED_YEAR);
        int week = lastWeek.get(IsoFields.WEEK_OF_WEEK_BASED_YEAR);
        
        archiveService.getWeeklyArchive(year, week, null, 0, 20);
        
        LocalDate monday = lastWeek.with(java.time.DayOfWeek.MONDAY);
        verify(discoveryService).discover(monday.toString(), monday.plusWeeks(1).toString(), null, 0, 20);
    }

    @Test
    void testMonthlyArchiveFutureMonth() {
        YearMonth nextMonth = YearMonth.now(zoneId).plusMonths(1);
        assertThrows(IllegalArgumentException.class, () ->
                archiveService.getMonthlyArchive(nextMonth.getYear(), nextMonth.getMonthValue(), null, 0, 20));
    }

    @Test
    void testMonthlyArchiveCurrentMonth() {
        YearMonth currentMonth = YearMonth.now(zoneId);
        archiveService.getMonthlyArchive(currentMonth.getYear(), currentMonth.getMonthValue(), null, 0, 20);
        
        LocalDate start = currentMonth.atDay(1);
        LocalDate end = currentMonth.plusMonths(1).atDay(1);
        verify(discoveryService).discover(start.toString(), end.toString(), null, 0, 20);
    }

    @Test
    void testMonthlyArchivePreviousMonth() {
        YearMonth prevMonth = YearMonth.now(zoneId).minusMonths(1);
        archiveService.getMonthlyArchive(prevMonth.getYear(), prevMonth.getMonthValue(), null, 0, 20);
        
        LocalDate start = prevMonth.atDay(1);
        LocalDate end = prevMonth.plusMonths(1).atDay(1);
        verify(discoveryService).discover(start.toString(), end.toString(), null, 0, 20);
    }

    @Test
    void testLeapYearFebruary() {
        archiveService.getMonthlyArchive(2024, 2, null, 0, 20);
        verify(discoveryService).discover("2024-02-01", "2024-03-01", null, 0, 20);
    }

    @Test
    void testIsoWeekCrossingYear() {
        // Week 53 of 2020 is Dec 28, 2020 to Jan 3, 2021
        archiveService.getWeeklyArchive(2020, 53, null, 0, 20);
        verify(discoveryService).discover("2020-12-28", "2021-01-04", null, 0, 20);
    }
}
