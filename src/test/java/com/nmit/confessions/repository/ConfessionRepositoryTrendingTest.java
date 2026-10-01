package com.nmit.confessions.repository;

import com.nmit.confessions.entity.Confession;
import com.nmit.confessions.enums.ConfessionCategory;
import com.nmit.confessions.enums.ConfessionStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.test.context.ActiveProfiles;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class ConfessionRepositoryTrendingTest {

    @Autowired
    private ConfessionRepository confessionRepository;

    @BeforeEach
    void setUp() {
        confessionRepository.deleteAll();

        Instant now = Instant.now();

        // 1. Highly reacted, recent
        createConfession("Trending 1", "Lot of reactions", ConfessionStatus.PUBLISHED, ConfessionCategory.FUNNY, 10, 5, 2, 8, now.minus(1, ChronoUnit.DAYS)); // Total: 25

        // 2. Moderately reacted, recent
        createConfession("Trending 2", "Some reactions", ConfessionStatus.PUBLISHED, ConfessionCategory.CRUSH, 5, 2, 0, 3, now.minus(2, ChronoUnit.DAYS)); // Total: 10
        
        // 3. Zero reactions, recent
        createConfession("Trending 3", "Zero reactions", ConfessionStatus.PUBLISHED, ConfessionCategory.RANT, 0, 0, 0, 0, now.minus(3, ChronoUnit.DAYS)); // Total: 0

        // 4. Highly reacted, but OLD (outside 7 day window)
        createConfession("Trending Old", "Very old but popular", ConfessionStatus.PUBLISHED, ConfessionCategory.FUNNY, 100, 100, 100, 100, now.minus(10, ChronoUnit.DAYS));

        // 5. Highly reacted, but PENDING
        createConfession("Trending Pending", "Pending confession", ConfessionStatus.PENDING, ConfessionCategory.CRUSH, 20, 20, 0, 0, now.minus(1, ChronoUnit.DAYS));

        // 6. Tiebreaker check (Same reactions as Trending 2, but newer publishedAt)
        createConfession("Trending Tie 1", "Tie reaction", ConfessionStatus.PUBLISHED, ConfessionCategory.CAMPUS_LIFE, 10, 0, 0, 0, now.minus(1, ChronoUnit.HOURS)); // Total: 10

        // 7. Future publication timestamp excluded
        createConfession("Trending Future", "Future", ConfessionStatus.PUBLISHED, ConfessionCategory.OTHER, 50, 50, 0, 0, now.plus(1, ChronoUnit.DAYS));
    }

    private void createConfession(String title, String content, ConfessionStatus status, ConfessionCategory category, 
                                  int love, int funny, int sad, int fire, Instant publishedAt) {
        Confession c = new Confession();
        c.setTitle(title);
        c.setContent(content);
        c.setCategory(category);
        c.setStatus(status);
        c.setPublishedAt(publishedAt);
        // We set createdAt same as publishedAt for simplicity in tests
        c.setCreatedAt(publishedAt);
        c.setReactionLoveCount(love);
        c.setReactionFunnyCount(funny);
        c.setReactionSadCount(sad);
        c.setReactionFireCount(fire);
        // We also ensure reportCount is > 0 for one of them to prove it doesn't affect ranking, but wait, the query clearly doesn't include it.
        c.setReportCount(10);
        confessionRepository.save(c);
    }

    @Test
    void testTrendingRankingAndFiltering() {
        Pageable pageable = PageRequest.of(0, 10);
        Instant now = Instant.now();
        Instant start = now.minus(7, ChronoUnit.DAYS);

        Page<Confession> result = confessionRepository.findTrendingConfessions(start, now, pageable);
        List<Confession> content = result.getContent();

        // Should include: "Trending 1", "Trending Tie 1", "Trending 2", "Trending 3"
        // Should exclude: "Trending Old", "Trending Pending", "Trending Future"
        assertThat(content).hasSize(4);

        // Check ranking:
        // 1st: Trending 1 (25 reactions)
        // 2nd: Trending Tie 1 (10 reactions, newer)
        // 3rd: Trending 2 (10 reactions, older)
        // 4th: Trending 3 (0 reactions)
        assertThat(content.get(0).getTitle()).isEqualTo("Trending 1");
        assertThat(content.get(1).getTitle()).isEqualTo("Trending Tie 1");
        assertThat(content.get(2).getTitle()).isEqualTo("Trending 2");
        assertThat(content.get(3).getTitle()).isEqualTo("Trending 3");
    }

    @Test
    void testTrendingCategory() {
        Pageable pageable = PageRequest.of(0, 10);
        Instant now = Instant.now();
        Instant start = now.minus(7, ChronoUnit.DAYS);

        Page<Confession> result = confessionRepository.findTrendingConfessionsByCategory(ConfessionCategory.FUNNY, start, now, pageable);
        List<Confession> content = result.getContent();

        // Only "Trending 1" is FUNNY inside the window
        assertThat(content).hasSize(1);
        assertThat(content.get(0).getTitle()).isEqualTo("Trending 1");
    }
}
