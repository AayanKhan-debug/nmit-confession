package com.nmit.confessions.service;

import com.nmit.confessions.dto.PublicConfessionResponse;
import com.nmit.confessions.entity.Confession;
import com.nmit.confessions.enums.ConfessionCategory;
import com.nmit.confessions.enums.ConfessionStatus;
import com.nmit.confessions.repository.ConfessionRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeParseException;
import java.time.temporal.ChronoUnit;

@Service
@Transactional(readOnly = true)
public class DiscoveryService {

    private final ConfessionRepository confessionRepository;
    private final PublicConfessionService publicConfessionService; // To reuse DTO mapping

    @Value("${app.discovery.timezone:UTC}")
    private String discoveryTimezone;

    @Value("${app.discovery.max-date-range-days:31}")
    private long maxDateRangeDays;

    public DiscoveryService(ConfessionRepository confessionRepository, PublicConfessionService publicConfessionService) {
        this.confessionRepository = confessionRepository;
        this.publicConfessionService = publicConfessionService;
    }

    public Page<PublicConfessionResponse> discover(String fromDateStr, String toDateStr, ConfessionCategory category, int page, int size) {
        validatePagination(page, size);

        LocalDate fromDate;
        LocalDate toDate;
        try {
            fromDate = LocalDate.parse(fromDateStr);
            toDate = LocalDate.parse(toDateStr);
        } catch (DateTimeParseException e) {
            throw new IllegalArgumentException("Invalid date format. Expected YYYY-MM-DD.");
        }

        if (!fromDate.isBefore(toDate)) {
            throw new IllegalArgumentException("'from' date must be strictly before 'to' date.");
        }

        long daysBetween = ChronoUnit.DAYS.between(fromDate, toDate);
        if (daysBetween > maxDateRangeDays) {
            throw new IllegalArgumentException("Date range exceeds maximum allowed limit of " + maxDateRangeDays + " days.");
        }

        ZoneId zoneId = getZoneId();
        Instant start = fromDate.atStartOfDay(zoneId).toInstant();
        Instant end = toDate.atStartOfDay(zoneId).toInstant();

        int boundedSize = Math.min(size, 50);
        Pageable pageable = PageRequest.of(page, boundedSize, org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "createdAt"));
        Page<Confession> confessions;

        if (category != null) {
            confessions = confessionRepository.findByStatusAndCategoryAndDateRange(
                    ConfessionStatus.PUBLISHED, category, start, end, pageable);
        } else {
            confessions = confessionRepository.findByStatusAndDateRange(
                    ConfessionStatus.PUBLISHED, start, end, pageable);
        }

        // We can safely map entities using a similar approach to PublicConfessionService
        return confessions.map(this::mapToPublicResponse);
    }

    public Page<PublicConfessionResponse> discoverToday(ConfessionCategory category, int page, int size) {
        validatePagination(page, size);
        ZoneId zoneId = getZoneId();
        LocalDate today = LocalDate.now(zoneId);
        LocalDate tomorrow = today.plusDays(1);
        
        return discover(today.toString(), tomorrow.toString(), category, page, size);
    }

    private ZoneId getZoneId() {
        try {
            return ZoneId.of(discoveryTimezone);
        } catch (Exception e) {
            return ZoneId.of("UTC");
        }
    }

    private void validatePagination(int page, int size) {
        if (page < 0) throw new IllegalArgumentException("Page index must not be less than zero.");
        if (size <= 0) throw new IllegalArgumentException("Page size must be greater than zero.");
        if (size > 50) throw new IllegalArgumentException("Page size must not exceed 50.");
    }

    private PublicConfessionResponse mapToPublicResponse(Confession confession) {
        PublicConfessionResponse response = new PublicConfessionResponse();
        response.setId(confession.getId());
        response.setTitle(confession.getTitle());
        response.setContent(confession.getContent());
        response.setCategory(confession.getCategory());
        response.setCreatedAt(confession.getCreatedAt());

        // Construct a summary of reactions (assuming PublicConfessionService uses something similar, but let's just populate directly)
        response.setReactions(java.util.Map.of(
            "LOVE", confession.getReactionLoveCount(),
            "FUNNY", confession.getReactionFunnyCount(),
            "SAD", confession.getReactionSadCount(),
            "FIRE", confession.getReactionFireCount()
        ));
        
        return response;
    }
}
