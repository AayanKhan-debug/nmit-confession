package com.nmit.confessions.service;

import com.nmit.confessions.dto.AdminReportResponse;
import com.nmit.confessions.entity.Admin;
import com.nmit.confessions.entity.Confession;
import com.nmit.confessions.entity.Report;
import com.nmit.confessions.enums.ConfessionStatus;
import com.nmit.confessions.enums.ReportReason;
import com.nmit.confessions.enums.ReportStatus;
import com.nmit.confessions.repository.AdminRepository;
import com.nmit.confessions.repository.AuditLogRepository;
import com.nmit.confessions.repository.ReportRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminReportServiceTest {

    @Mock
    private ReportRepository reportRepository;
    @Mock
    private AdminRepository adminRepository;
    @Mock
    private AuditLogRepository auditLogRepository;

    @InjectMocks
    private AdminReportService adminReportService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(adminReportService, "discoveryTimezone", "UTC");
    }

    @Test
    void testGetReports() {
        Report report = new Report();
        report.setId(1L);
        report.setStatus(ReportStatus.PENDING);
        report.setReason(ReportReason.SPAM);
        report.setCreatedAt(Instant.now());

        Confession confession = new Confession();
        confession.setId(10L);
        confession.setStatus(ConfessionStatus.PUBLISHED);
        report.setConfession(confession);

        when(reportRepository.findAll(any(Specification.class), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(report)));

        Page<AdminReportResponse> result = adminReportService.getReports(ReportStatus.PENDING, ReportReason.SPAM, ConfessionStatus.PUBLISHED, "2026-10-01", "2026-10-10", "newest", 0, 20);

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getId()).isEqualTo(1L);
        assertThat(result.getContent().get(0).getConfessionId()).isEqualTo(10L);
    }

    @Test
    void testResolveReport() {
        Report report = new Report();
        report.setId(1L);
        report.setStatus(ReportStatus.PENDING);
        Confession confession = new Confession();
        confession.setId(10L);
        confession.setStatus(ConfessionStatus.PUBLISHED);
        report.setConfession(confession);

        Admin admin = new Admin();
        admin.setUsername("admin");

        when(reportRepository.findById(1L)).thenReturn(Optional.of(report));
        when(adminRepository.findByUsername("admin")).thenReturn(Optional.of(admin));

        adminReportService.resolveReport(1L, "admin");

        assertThat(report.getStatus()).isEqualTo(ReportStatus.RESOLVED);
        assertThat(report.getResolvedBy()).isEqualTo(admin);
        verify(reportRepository).save(report);
        verify(auditLogRepository).save(any());
    }
}
