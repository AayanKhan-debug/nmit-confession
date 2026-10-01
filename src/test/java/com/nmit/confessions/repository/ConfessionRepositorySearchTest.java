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
import org.springframework.data.domain.Sort;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class ConfessionRepositorySearchTest {

    @Autowired
    private ConfessionRepository confessionRepository;

    @BeforeEach
    void setUp() {
        confessionRepository.deleteAll();

        // Matching PUBLISHED title
        createConfession("College Fest 2026", "It was amazing", ConfessionStatus.PUBLISHED, ConfessionCategory.CAMPUS_LIFE);
        
        // Matching PUBLISHED content
        createConfession("Exam time", "Studying in the college library", ConfessionStatus.PUBLISHED, ConfessionCategory.RANT);
        
        // Not matching PUBLISHED
        createConfession("Hello world", "Just chilling", ConfessionStatus.PUBLISHED, ConfessionCategory.FUNNY);

        // Matching PENDING
        createConfession("Secret college crush", "I saw him today", ConfessionStatus.PENDING, ConfessionCategory.CRUSH);
        
        // Matching HIDDEN
        createConfession("Bad college food", "Disgusting", ConfessionStatus.HIDDEN, ConfessionCategory.RANT);

        // Case-insensitive match
        createConfession("coLLeGe vibes", "Awesome", ConfessionStatus.PUBLISHED, ConfessionCategory.CAMPUS_LIFE);
        
        // Partial match
        createConfession("My col leg", "I broke it", ConfessionStatus.PUBLISHED, ConfessionCategory.OTHER); // Should NOT match 'college'

        // Escaping test
        createConfession("100% real", "No cap", ConfessionStatus.PUBLISHED, ConfessionCategory.FUNNY);
    }

    private void createConfession(String title, String content, ConfessionStatus status, ConfessionCategory category) {
        Confession c = new Confession();
        c.setTitle(title);
        c.setContent(content);
        c.setCategory(category);
        c.setStatus(status);
        confessionRepository.save(c);
    }

    @Test
    void testSearchPublishedConfessions() {
        Pageable pageable = PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Confession> result = confessionRepository.searchPublishedConfessions("college", pageable);
        List<Confession> content = result.getContent();

        // Should match "College Fest 2026", "Exam time", "coLLeGe vibes"
        // Should NOT match PENDING or HIDDEN despite containing "college"
        // Should NOT match "Hello world" or "My col leg"
        assertThat(content).hasSize(3);
        assertThat(content).extracting(Confession::getTitle).containsExactlyInAnyOrder(
                "College Fest 2026", "Exam time", "coLLeGe vibes"
        );
    }

    @Test
    void testSearchCategory() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Confession> result = confessionRepository.searchPublishedConfessionsByCategory("college", ConfessionCategory.CAMPUS_LIFE, pageable);
        List<Confession> content = result.getContent();

        // "College Fest 2026" and "coLLeGe vibes" are CAMPUS_LIFE
        assertThat(content).hasSize(2);
        assertThat(content).extracting(Confession::getTitle).containsExactlyInAnyOrder(
                "College Fest 2026", "coLLeGe vibes"
        );
    }

    @Test
    void testSearchEscapedWildcards() {
        Pageable pageable = PageRequest.of(0, 10);
        // Searching for "100\%" literally
        Page<Confession> result = confessionRepository.searchPublishedConfessions("100\\%", pageable);
        List<Confession> content = result.getContent();

        assertThat(content).hasSize(1);
        assertThat(content.get(0).getTitle()).isEqualTo("100% real");
    }

    @Test
    void testNoResults() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Confession> result = confessionRepository.searchPublishedConfessions("nonexistent", pageable);
        assertThat(result.getContent()).isEmpty();
    }
}
