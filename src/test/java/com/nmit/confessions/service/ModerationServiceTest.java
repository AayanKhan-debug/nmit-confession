package com.nmit.confessions.service;

import com.nmit.confessions.dto.ModerationQueueItemResponse;
import com.nmit.confessions.entity.Confession;
import com.nmit.confessions.enums.ConfessionCategory;
import com.nmit.confessions.enums.ConfessionStatus;
import com.nmit.confessions.enums.ScreeningFlag;
import com.nmit.confessions.repository.AdminRepository;
import com.nmit.confessions.repository.AuditLogRepository;
import com.nmit.confessions.repository.ConfessionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ModerationServiceTest {

    @Mock
    private ConfessionRepository confessionRepository;

    @Mock
    private AdminRepository adminRepository;

    @Mock
    private AuditLogRepository auditLogRepository;

    @InjectMocks
    private ModerationService moderationService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(moderationService, "discoveryTimezone", "UTC");
    }

    @Test
    void testGetModerationQueue_WithFilters() {
        Confession mockConf = new Confession();
        mockConf.setId(10L);
        mockConf.setStatus(ConfessionStatus.PENDING);
        mockConf.setCategory(ConfessionCategory.CRUSH);
        mockConf.setScreeningFlags(Set.of(ScreeningFlag.PROFANITY));
        mockConf.setCreatedAt(Instant.now());
        mockConf.setReportCount(3);

        Page<Confession> page = new PageImpl<>(List.of(mockConf));

        when(confessionRepository.findAll(any(Specification.class), any(Pageable.class)))
                .thenReturn(page);

        Page<ModerationQueueItemResponse> response = moderationService.getModerationQueue(
                ConfessionStatus.PENDING,
                ConfessionCategory.CRUSH,
                ScreeningFlag.PROFANITY,
                "2026-10-01",
                "2026-10-02",
                "priority",
                0,
                20
        );

        assertThat(response.getContent()).hasSize(1);
        assertThat(response.getContent().get(0).getId()).isEqualTo(10L);
        assertThat(response.getContent().get(0).getReportCount()).isEqualTo(3);

        ArgumentCaptor<Pageable> pageableCaptor = ArgumentCaptor.forClass(Pageable.class);
        verify(confessionRepository).findAll(any(Specification.class), pageableCaptor.capture());
        
        // Priority sort mapping check
        assertThat(pageableCaptor.getValue().getSort().toString())
            .contains("reportCount: DESC", "createdAt: DESC", "id: DESC");
    }

    @Test
    void testGetModerationQueue_InvalidDateRange() {
        assertThatThrownBy(() -> moderationService.getModerationQueue(
                ConfessionStatus.PENDING, null, null, "2026-10-02", "2026-10-01", "newest", 0, 20
        ))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessageContaining("'from' date must be strictly before 'to' date.");
    }

    @Test
    void testGetModerationQueue_SameDateRange() {
        assertThatThrownBy(() -> moderationService.getModerationQueue(
                ConfessionStatus.PENDING, null, null, "2026-10-01", "2026-10-01", "newest", 0, 20
        ))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessageContaining("'from' date must be strictly before 'to' date.");
    }

    @Test
    void testGetModerationQueue_InvalidSort() {
        assertThatThrownBy(() -> moderationService.getModerationQueue(
                ConfessionStatus.PENDING, null, null, null, null, "randomSort", 0, 20
        ))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessageContaining("Invalid sort option");
    }
}
