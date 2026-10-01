package com.nmit.confessions.service;

import com.nmit.confessions.dto.PublicConfessionResponse;
import com.nmit.confessions.entity.Confession;
import com.nmit.confessions.enums.ConfessionCategory;
import com.nmit.confessions.repository.ConfessionRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class SearchService {

    private final ConfessionRepository confessionRepository;
    
    // Max query length to prevent abuse
    private static final int MAX_QUERY_LENGTH = 100;

    public SearchService(ConfessionRepository confessionRepository) {
        this.confessionRepository = confessionRepository;
    }

    public Page<PublicConfessionResponse> search(String query, ConfessionCategory category, int page, int size) {
        if (query == null) {
            throw new IllegalArgumentException("Search query cannot be missing.");
        }

        String normalizedQuery = query.trim();

        if (normalizedQuery.isEmpty()) {
            throw new IllegalArgumentException("Search query cannot be blank.");
        }

        if (normalizedQuery.length() > MAX_QUERY_LENGTH) {
            throw new IllegalArgumentException("Search query exceeds maximum length of " + MAX_QUERY_LENGTH + " characters.");
        }

        validatePagination(page, size);

        // Escape wildcard characters to treat them as literal characters
        String escapedQuery = escapeLikeWildcards(normalizedQuery);

        int boundedSize = Math.min(size, 50);
        // Deterministic ordering: createdAt DESC, id DESC
        Pageable pageable = PageRequest.of(page, boundedSize, Sort.by(Sort.Direction.DESC, "createdAt", "id"));
        
        Page<Confession> confessions;
        if (category != null) {
            confessions = confessionRepository.searchPublishedConfessionsByCategory(escapedQuery, category, pageable);
        } else {
            confessions = confessionRepository.searchPublishedConfessions(escapedQuery, pageable);
        }

        return confessions.map(this::mapToPublicResponse);
    }
    
    private String escapeLikeWildcards(String query) {
        return query
            .replace("\\", "\\\\")
            .replace("%", "\\%")
            .replace("_", "\\_");
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
