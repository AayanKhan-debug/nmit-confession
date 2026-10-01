package com.nmit.confessions.service;

import com.nmit.confessions.dto.PublicConfessionResponse;
import com.nmit.confessions.entity.Confession;
import com.nmit.confessions.enums.ConfessionStatus;
import com.nmit.confessions.repository.ConfessionRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.Random;

@Service
@Transactional(readOnly = true)
public class DailyConfessionService {

    private final ConfessionRepository confessionRepository;
    
    @Value("${app.discovery.timezone:UTC}")
    private String discoveryTimezone;

    public DailyConfessionService(ConfessionRepository confessionRepository) {
        this.confessionRepository = confessionRepository;
    }

    public Optional<PublicConfessionResponse> getDailyConfession() {
        ZoneId zoneId = getZoneId();
        LocalDate today = LocalDate.now(zoneId);
        Instant startOfDay = today.atStartOfDay(zoneId).toInstant();

        // Load all IDs created before the start of today to ensure the candidate list is stable.
        List<Long> candidateIds = confessionRepository.findCandidateIdsForDaily(startOfDay);

        if (candidateIds.isEmpty()) {
            return Optional.empty();
        }

        // Sort to ensure absolute determinism regardless of DB retrieval order
        Collections.sort(candidateIds);

        // Seed with today's epoch day
        long seed = today.toEpochDay();
        Random random = new Random(seed);
        Collections.shuffle(candidateIds, random);

        // Find the first one that is CURRENTLY published
        for (Long id : candidateIds) {
            Optional<Confession> opt = confessionRepository.findByIdAndStatus(id, ConfessionStatus.PUBLISHED);
            if (opt.isPresent()) {
                return Optional.of(mapToPublicResponse(opt.get()));
            }
        }

        return Optional.empty();
    }

    private ZoneId getZoneId() {
        try {
            return ZoneId.of(discoveryTimezone);
        } catch (Exception e) {
            return ZoneId.of("UTC");
        }
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
