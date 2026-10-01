package com.nmit.confessions.service;

import com.nmit.confessions.dto.AdminReportResponse;
import com.nmit.confessions.dto.ModerationActionResponse;
import com.nmit.confessions.entity.Admin;
import com.nmit.confessions.entity.AuditLog;
import com.nmit.confessions.entity.Report;
import com.nmit.confessions.enums.AuditAction;
import com.nmit.confessions.enums.ConfessionStatus;
import com.nmit.confessions.enums.ReportReason;
import com.nmit.confessions.enums.ReportStatus;
import com.nmit.confessions.exception.InvalidModerationStateException;
import com.nmit.confessions.exception.ResourceNotFoundException;
import com.nmit.confessions.repository.AdminRepository;
import com.nmit.confessions.repository.AuditLogRepository;
import com.nmit.confessions.repository.ReportRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeParseException;

@Service
public class AdminReportService {

    private final ReportRepository reportRepository;
    private final AdminRepository adminRepository;
    private final AuditLogRepository auditLogRepository;

    @Value("${app.discovery.timezone:UTC}")
    private String discoveryTimezone;

    public AdminReportService(ReportRepository reportRepository, AdminRepository adminRepository, AuditLogRepository auditLogRepository) {
        this.reportRepository = reportRepository;
        this.adminRepository = adminRepository;
        this.auditLogRepository = auditLogRepository;
    }

    public Page<AdminReportResponse> getReports(
            ReportStatus status,
            ReportReason reason,
            ConfessionStatus confessionStatus,
            String from,
            String to,
            String sortStr,
            int page,
            int size) {

        Instant fromInstant = null;
        Instant toInstant = null;
        ZoneId zone = ZoneId.of(discoveryTimezone);

        try {
            if (from != null && !from.trim().isEmpty()) {
                fromInstant = LocalDate.parse(from).atStartOfDay(zone).toInstant();
            }
            if (to != null && !to.trim().isEmpty()) {
                toInstant = LocalDate.parse(to).atStartOfDay(zone).toInstant();
            }
        } catch (DateTimeParseException e) {
            throw new IllegalArgumentException("Invalid date format. Expected YYYY-MM-DD.");
        }

        if (fromInstant != null && toInstant != null) {
            if (fromInstant.isAfter(toInstant) || fromInstant.equals(toInstant)) {
                throw new IllegalArgumentException("'from' date must be strictly before 'to' date.");
            }
        }

        Sort sort;
        if ("oldest".equalsIgnoreCase(sortStr)) {
            sort = Sort.by(Sort.Direction.ASC, "createdAt").and(Sort.by(Sort.Direction.ASC, "id"));
        } else if ("newest".equalsIgnoreCase(sortStr) || sortStr == null) {
            sort = Sort.by(Sort.Direction.DESC, "createdAt").and(Sort.by(Sort.Direction.DESC, "id"));
        } else if ("reason".equalsIgnoreCase(sortStr)) {
            sort = Sort.by(Sort.Direction.ASC, "reason").and(Sort.by(Sort.Direction.DESC, "createdAt")).and(Sort.by(Sort.Direction.DESC, "id"));
        } else {
            throw new IllegalArgumentException("Invalid sort option. Use 'newest', 'oldest', or 'reason'.");
        }

        int boundedSize = Math.min(Math.max(1, size), 50);
        Pageable pageable = PageRequest.of(page < 0 ? 0 : page, boundedSize, sort);
        Specification<Report> spec = ReportSpecification.filterBy(status, reason, confessionStatus, fromInstant, toInstant);
        Page<Report> reports = reportRepository.findAll(spec, pageable);

        return reports.map(this::mapToResponse);
    }

    @Transactional
    public ModerationActionResponse resolveReport(Long id, String adminUsername) {
        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found"));

        if (report.getStatus() != ReportStatus.PENDING) {
            throw new InvalidModerationStateException("Only PENDING reports can be resolved.");
        }

        Admin admin = adminRepository.findByUsername(adminUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));

        report.setStatus(ReportStatus.RESOLVED);
        report.setResolvedBy(admin);
        report.setResolvedAt(Instant.now());
        reportRepository.save(report);

        AuditLog log = new AuditLog();
        log.setAdmin(admin);
        log.setAction(AuditAction.RESOLVE_REPORT);
        log.setTargetType("REPORT");
        log.setTargetId(report.getId());
        log.setDetails("Resolved report for confession: " + report.getConfession().getId());
        auditLogRepository.save(log);

        return new ModerationActionResponse("Report resolved.", report.getId(), report.getConfession() != null ? report.getConfession().getStatus() : ConfessionStatus.PENDING);
    }

    private AdminReportResponse mapToResponse(Report report) {
        AdminReportResponse response = new AdminReportResponse();
        response.setId(report.getId());
        response.setReason(report.getReason());
        response.setStatus(report.getStatus());
        response.setCreatedAt(report.getCreatedAt());
        response.setResolvedAt(report.getResolvedAt());

        if (report.getConfession() != null) {
            response.setConfessionId(report.getConfession().getId());
            response.setConfessionTitle(report.getConfession().getTitle());
            response.setConfessionContent(report.getConfession().getContent());
            response.setConfessionCategory(report.getConfession().getCategory());
            response.setConfessionStatus(report.getConfession().getStatus());
        }

        return response;
    }
}
