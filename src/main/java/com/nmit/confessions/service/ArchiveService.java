package com.nmit.confessions.service;

import com.nmit.confessions.dto.PublicConfessionResponse;
import com.nmit.confessions.enums.ConfessionCategory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.ZoneId;
import java.time.format.DateTimeParseException;
import java.time.temporal.IsoFields;
import java.time.temporal.WeekFields;

@Service
public class ArchiveService {

    private final DiscoveryService discoveryService;

    @Value("${app.discovery.timezone:UTC}")
    private String discoveryTimezone;

    public ArchiveService(DiscoveryService discoveryService) {
        this.discoveryService = discoveryService;
    }

    public Page<PublicConfessionResponse> getDailyArchive(String dateStr, ConfessionCategory category, int page, int size) {
        LocalDate requestDate;
        try {
            requestDate = LocalDate.parse(dateStr);
        } catch (DateTimeParseException e) {
            throw new IllegalArgumentException("Invalid date format. Expected YYYY-MM-DD.");
        }

        ZoneId zoneId = getZoneId();
        LocalDate today = LocalDate.now(zoneId);

        if (requestDate.isAfter(today)) {
            throw new IllegalArgumentException("Future archive dates are not available.");
        }

        LocalDate nextDay = requestDate.plusDays(1);

        return discoveryService.discover(requestDate.toString(), nextDay.toString(), category, page, size);
    }

    public Page<PublicConfessionResponse> getWeeklyArchive(int year, int week, ConfessionCategory category, int page, int size) {
        if (week < 1 || week > 53) {
            throw new IllegalArgumentException("Invalid ISO week number.");
        }

        ZoneId zoneId = getZoneId();
        LocalDate today = LocalDate.now(zoneId);

        int currentYear = today.get(IsoFields.WEEK_BASED_YEAR);
        int currentWeek = today.get(IsoFields.WEEK_OF_WEEK_BASED_YEAR);

        if (year > currentYear || (year == currentYear && week > currentWeek)) {
            throw new IllegalArgumentException("Future archive weeks are not available.");
        }

        LocalDate monday = LocalDate.of(year, 2, 1)
                .with(IsoFields.WEEK_BASED_YEAR, year)
                .with(IsoFields.WEEK_OF_WEEK_BASED_YEAR, week)
                .with(java.time.DayOfWeek.MONDAY);
                
        LocalDate nextMonday = monday.plusWeeks(1);

        // Discovery service expects string from/to dates. Max date range is 31, week is 7 days so it passes validation.
        return discoveryService.discover(monday.toString(), nextMonday.toString(), category, page, size);
    }

    public Page<PublicConfessionResponse> getMonthlyArchive(int year, int month, ConfessionCategory category, int page, int size) {
        if (month < 1 || month > 12) {
            throw new IllegalArgumentException("Invalid month.");
        }

        ZoneId zoneId = getZoneId();
        YearMonth currentYearMonth = YearMonth.now(zoneId);
        YearMonth requestYearMonth = YearMonth.of(year, month);

        if (requestYearMonth.isAfter(currentYearMonth)) {
            throw new IllegalArgumentException("Future archive months are not available.");
        }

        LocalDate startOfMonth = requestYearMonth.atDay(1);
        LocalDate startOfNextMonth = requestYearMonth.plusMonths(1).atDay(1);

        // Since monthly range might be 31 days (e.g. October), it perfectly fits max-date-range-days=31!
        return discoveryService.discover(startOfMonth.toString(), startOfNextMonth.toString(), category, page, size);
    }

    private ZoneId getZoneId() {
        try {
            return ZoneId.of(discoveryTimezone);
        } catch (Exception e) {
            return ZoneId.of("UTC");
        }
    }
}
