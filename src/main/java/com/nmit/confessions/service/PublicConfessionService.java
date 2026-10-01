package com.nmit.confessions.service;

import com.nmit.confessions.dto.PublicConfessionResponse;
import com.nmit.confessions.entity.Confession;
import com.nmit.confessions.enums.ConfessionCategory;
import com.nmit.confessions.enums.ConfessionStatus;
import com.nmit.confessions.repository.ConfessionRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class PublicConfessionService {

    private final ConfessionRepository confessionRepository;

    public PublicConfessionService(ConfessionRepository confessionRepository) {
        this.confessionRepository = confessionRepository;
    }

    public Page<PublicConfessionResponse> getPublicFeed(ConfessionCategory category, int page, int size) {
        int boundedSize = Math.min(size, 50);
        Pageable pageable = PageRequest.of(page, boundedSize, Sort.by(Sort.Direction.DESC, "createdAt"));
        
        Page<Confession> confessions;
        if (category != null) {
            confessions = confessionRepository.findByStatusAndCategory(ConfessionStatus.PUBLISHED, category, pageable);
        } else {
            confessions = confessionRepository.findByStatus(ConfessionStatus.PUBLISHED, pageable);
        }
        
        return confessions.map(this::mapToPublicResponse);
    }

    private PublicConfessionResponse mapToPublicResponse(Confession confession) {
        PublicConfessionResponse dto = new PublicConfessionResponse();
        dto.setId(confession.getId());
        dto.setTitle(confession.getTitle());
        dto.setContent(confession.getContent());
        dto.setCategory(confession.getCategory());
        dto.setCreatedAt(confession.getCreatedAt());

        Map<String, Integer> reactions = new HashMap<>();
        reactions.put("LOVE", confession.getReactionLoveCount());
        reactions.put("FUNNY", confession.getReactionFunnyCount());
        reactions.put("SAD", confession.getReactionSadCount());
        reactions.put("FIRE", confession.getReactionFireCount());
        dto.setReactions(reactions);

        return dto;
    }
}
