package com.nmit.confessions.service;

import com.nmit.confessions.dto.PublicConfessionResponse;
import com.nmit.confessions.entity.Confession;
import com.nmit.confessions.enums.ConfessionCategory;
import com.nmit.confessions.repository.ConfessionRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Service
@Transactional(readOnly = true)
public class TrendingService {

    private final ConfessionRepository confessionRepository;
    
    @Value("${app.trending.window-days:7}")
    private int windowDays;

    public TrendingService(ConfessionRepository confessionRepository) {
        this.confessionRepository = confessionRepository;
    }

    public Page<PublicConfessionResponse> getTrending(ConfessionCategory category, int page, int size) {
        validatePagination(page, size);

        int boundedSize = Math.min(size, 50);
        // Note: Ordering is handled entirely by the JPQL query
        // so we don't pass Sort to PageRequest here.
        Pageable pageable = PageRequest.of(page, boundedSize);
        
        Instant now = Instant.now();
        Instant start = now.minus(windowDays, ChronoUnit.DAYS);

        Page<Confession> confessions;
        if (category != null) {
            confessions = confessionRepository.findTrendingConfessionsByCategory(category, start, now, pageable);
        } else {
            confessions = confessionRepository.findTrendingConfessions(start, now, pageable);
        }

        return confessions.map(this::mapToPublicResponse);
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
        
        response.setReactions(java.util.Map.of(
            "LOVE", confession.getReactionLoveCount(),
            "FUNNY", confession.getReactionFunnyCount(),
            "SAD", confession.getReactionSadCount(),
            "FIRE", confession.getReactionFireCount()
        ));
        
        return response;
    }
}
