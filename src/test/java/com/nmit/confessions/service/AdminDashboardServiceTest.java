package com.nmit.confessions.service;

import com.nmit.confessions.dto.AdminDashboardResponse;
import com.nmit.confessions.entity.AuditLog;
import com.nmit.confessions.enums.AuditAction;
import com.nmit.confessions.enums.ConfessionCategory;
import com.nmit.confessions.enums.ConfessionStatus;
import com.nmit.confessions.enums.ReportStatus;
import com.nmit.confessions.enums.ScreeningFlag;
import com.nmit.confessions.repository.AuditLogRepository;
import com.nmit.confessions.repository.ConfessionRepository;
import com.nmit.confessions.repository.ReportRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.time.Instant;
import java.util.Arrays;
import java.util.Collections;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

class AdminDashboardServiceTest {

    @Mock
    private ConfessionRepository confessionRepository;

    @Mock
    private ReportRepository reportRepository;

    @Mock
    private AuditLogRepository auditLogRepository;

    @InjectMocks
    private AdminDashboardService adminDashboardService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testGetDashboardMetrics() {
        when(confessionRepository.countByStatus(ConfessionStatus.PENDING)).thenReturn(10L);
        when(confessionRepository.countByStatus(ConfessionStatus.HIDDEN)).thenReturn(2L);
        when(confessionRepository.countByStatus(ConfessionStatus.PUBLISHED)).thenReturn(100L);
        when(confessionRepository.countByStatus(ConfessionStatus.REJECTED)).thenReturn(5L);
        
        when(confessionRepository.countByStatusAndScreeningFlagsIsNotEmpty(ConfessionStatus.PENDING)).thenReturn(3L);
        when(reportRepository.countByStatus(ReportStatus.PENDING)).thenReturn(4L);
        
        Object[] flag1 = new Object[]{ScreeningFlag.PROFANITY, 2L};
        Object[] flag2 = new Object[]{ScreeningFlag.SUSPICIOUS_LINK, 1L};
        when(confessionRepository.countScreeningFlagsByStatus(ConfessionStatus.PENDING)).thenReturn(Arrays.asList(flag1, flag2));
        
        Object[] cat1 = new Object[]{ConfessionCategory.CAMPUS_LIFE, 6L};
        Object[] cat2 = new Object[]{ConfessionCategory.RANT, 4L};
        when(confessionRepository.countByCategoryAndStatus(ConfessionStatus.PENDING)).thenReturn(Arrays.asList(cat1, cat2));
        
        AuditLog log1 = new AuditLog();
        log1.setId(1L);
        log1.setAction(AuditAction.APPROVE_CONFESSION);
        log1.setTargetType("CONFESSION");
        log1.setTargetId(100L);
        log1.setCreatedAt(Instant.now());
        when(auditLogRepository.findTop10ByOrderByCreatedAtDescIdDesc()).thenReturn(Collections.singletonList(log1));

        AdminDashboardResponse response = adminDashboardService.getDashboardMetrics();

        assertThat(response.getPendingConfessions()).isEqualTo(10L);
        assertThat(response.getFlaggedPendingConfessions()).isEqualTo(3L);
        assertThat(response.getPendingReports()).isEqualTo(4L);
        
        assertThat(response.getFlagCounts()).containsEntry("PROFANITY", 2L);
        assertThat(response.getFlagCounts()).containsEntry("SUSPICIOUS_LINK", 1L);
        
        assertThat(response.getCategoryCounts()).containsEntry("CAMPUS_LIFE", 6L);
        assertThat(response.getCategoryCounts()).containsEntry("RANT", 4L);
        
        assertThat(response.getRecentActivity()).hasSize(1);
        assertThat(response.getRecentActivity().get(0).getAction()).isEqualTo("APPROVE_CONFESSION");
    }
}
