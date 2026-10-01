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

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class ConfessionRepositoryDiscoveryTest {

    @Autowired
    private ConfessionRepository confessionRepository;

    private Instant baseTime;

    @BeforeEach
    void setUp() {
        confessionRepository.deleteAll();
        baseTime = Instant.parse("2026-10-15T12:00:00Z");

        // 1. Published inside range
        createConfession("Published Inside", ConfessionStatus.PUBLISHED, ConfessionCategory.FUNNY, baseTime);
        
        // 2. Published outside range (before)
        createConfession("Published Before", ConfessionStatus.PUBLISHED, ConfessionCategory.FUNNY, baseTime.minus(10, ChronoUnit.DAYS));
        
        // 3. Published outside range (after)
        createConfession("Published After", ConfessionStatus.PUBLISHED, ConfessionCategory.FUNNY, baseTime.plus(10, ChronoUnit.DAYS));

        // 4. Other statuses inside range
        createConfession("Pending Inside", ConfessionStatus.PENDING, ConfessionCategory.FUNNY, baseTime);
        createConfession("Hidden Inside", ConfessionStatus.HIDDEN, ConfessionCategory.FUNNY, baseTime);
        createConfession("Rejected Inside", ConfessionStatus.REJECTED, ConfessionCategory.FUNNY, baseTime);

        // 5. Exact boundaries
        createConfession("Exact Start", ConfessionStatus.PUBLISHED, ConfessionCategory.FUNNY, Instant.parse("2026-10-10T00:00:00Z"));
        createConfession("Exact End", ConfessionStatus.PUBLISHED, ConfessionCategory.FUNNY, Instant.parse("2026-10-20T00:00:00Z")); // Excluded

        // 6. Different category inside range
        createConfession("Different Category", ConfessionStatus.PUBLISHED, ConfessionCategory.CRUSH, baseTime);
        
        // 7. Order testing
        createConfession("Order 1", ConfessionStatus.PUBLISHED, ConfessionCategory.FUNNY, baseTime.plus(1, ChronoUnit.HOURS));
        createConfession("Order 2", ConfessionStatus.PUBLISHED, ConfessionCategory.FUNNY, baseTime.minus(1, ChronoUnit.HOURS));
    }

    private void createConfession(String title, ConfessionStatus status, ConfessionCategory category, Instant createdAt) {
        Confession c = new Confession();
        c.setTitle(title);
        c.setContent("Content for " + title);
        c.setCategory(category);
        c.setStatus(status);
        c.setCreatedAt(createdAt);
        confessionRepository.save(c);
    }

    @Test
    void testDiscoveryQueryFilters() {
        Instant start = Instant.parse("2026-10-10T00:00:00Z");
        Instant end = Instant.parse("2026-10-20T00:00:00Z");
        Pageable pageable = PageRequest.of(0, 20, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<Confession> result = confessionRepository.findByStatusAndDateRange(ConfessionStatus.PUBLISHED, start, end, pageable);
        List<Confession> content = result.getContent();

        assertThat(content).hasSize(5);
        
        // Excluded:
        assertThat(content).extracting(Confession::getTitle).doesNotContain(
            "Published Before", 
            "Published After", 
            "Pending Inside", 
            "Hidden Inside", 
            "Rejected Inside", 
            "Exact End"
        );

        // Included:
        assertThat(content).extracting(Confession::getTitle).contains(
            "Published Inside",
            "Exact Start",
            "Different Category",
            "Order 1",
            "Order 2"
        );

        // Newest-first ordering (Order 1 > Published Inside > Order 2 > Different Category > Exact Start)
        // Wait, Published Inside and Different Category have the same baseTime. So their relative order depends on DB.
        // We just verify Order 1 is first and Exact Start is last.
        assertThat(content.get(0).getTitle()).isEqualTo("Order 1");
        assertThat(content.get(4).getTitle()).isEqualTo("Exact Start");
    }

    @Test
    void testCategoryFiltering() {
        Instant start = Instant.parse("2026-10-10T00:00:00Z");
        Instant end = Instant.parse("2026-10-20T00:00:00Z");
        Pageable pageable = PageRequest.of(0, 20, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<Confession> result = confessionRepository.findByStatusAndCategoryAndDateRange(
            ConfessionStatus.PUBLISHED, ConfessionCategory.CRUSH, start, end, pageable);
        
        List<Confession> content = result.getContent();
        
        assertThat(content).hasSize(1);
        assertThat(content.get(0).getTitle()).isEqualTo("Different Category");
    }

    @Test
    void testPagination() {
        Instant start = Instant.parse("2026-10-10T00:00:00Z");
        Instant end = Instant.parse("2026-10-20T00:00:00Z");
        
        Pageable page1 = PageRequest.of(0, 2, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Confession> result1 = confessionRepository.findByStatusAndDateRange(ConfessionStatus.PUBLISHED, start, end, page1);
        
        assertThat(result1.getContent()).hasSize(2);
        assertThat(result1.getTotalElements()).isEqualTo(5);
        
        Pageable page2 = PageRequest.of(1, 2, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Confession> result2 = confessionRepository.findByStatusAndDateRange(ConfessionStatus.PUBLISHED, start, end, page2);
        
        assertThat(result2.getContent()).hasSize(2);
        
        Pageable page3 = PageRequest.of(2, 2, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Confession> result3 = confessionRepository.findByStatusAndDateRange(ConfessionStatus.PUBLISHED, start, end, page3);
        
        assertThat(result3.getContent()).hasSize(1);
    }
}
