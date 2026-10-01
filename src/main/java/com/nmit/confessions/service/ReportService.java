package com.nmit.confessions.service;

import com.nmit.confessions.dto.CreateReportRequest;
import com.nmit.confessions.dto.ReportResponse;
import com.nmit.confessions.entity.AuditLog;
import com.nmit.confessions.entity.Confession;
import com.nmit.confessions.entity.Report;
import com.nmit.confessions.enums.AuditAction;
import com.nmit.confessions.enums.ConfessionStatus;
import com.nmit.confessions.enums.ReportStatus;
import com.nmit.confessions.exception.DuplicateReactionException; // Reuse 409
import com.nmit.confessions.exception.ResourceNotFoundException;
import com.nmit.confessions.repository.AuditLogRepository;
import com.nmit.confessions.repository.ConfessionRepository;
import com.nmit.confessions.repository.ReportRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReportService {

    private final ReportRepository reportRepository;
    private final ConfessionRepository confessionRepository;
    private final DeviceTokenService deviceTokenService;
    private final ReportRateLimitService reportRateLimitService;
    private final AuditLogRepository auditLogRepository;

    @Value("${app.report.hide-threshold:5}")
    private int hideThreshold;

    public ReportService(ReportRepository reportRepository,
                         ConfessionRepository confessionRepository,
                         DeviceTokenService deviceTokenService,
                         ReportRateLimitService reportRateLimitService,
                         AuditLogRepository auditLogRepository) {
        this.reportRepository = reportRepository;
        this.confessionRepository = confessionRepository;
        this.deviceTokenService = deviceTokenService;
        this.reportRateLimitService = reportRateLimitService;
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional
    public ReportResponse submitReport(Long confessionId, CreateReportRequest request, String rawToken) {
        if (rawToken == null) {
            throw new IllegalArgumentException("Device token is required");
        }

        String tokenHash = deviceTokenService.hashToken(rawToken);

        if (!reportRateLimitService.isAllowed(tokenHash)) {
            throw new IllegalStateException("Rate limit exceeded for reporting");
        }

        Confession confession = confessionRepository.findById(confessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Confession not found"));

        if (confession.getStatus() != ConfessionStatus.PUBLISHED) {
            throw new ResourceNotFoundException("Confession not found");
        }

        Report report = new Report();
        report.setConfession(confession);
        report.setReason(request.getReason());
        report.setReporterTokenHash(tokenHash);
        report.setStatus(ReportStatus.PENDING);

        try {
            reportRepository.saveAndFlush(report);
        } catch (DataIntegrityViolationException e) {
            throw new DuplicateReactionException("Report already submitted by this device.");
        }

        confessionRepository.incrementReportCount(confessionId);

        // Fetch latest count (or we can assume reportCount + 1, but fetching ensures accuracy if needed, though +1 is fine.
        // Wait, increment happens in DB. In this transaction, it is incremented but the JVM object is stale.
        // We will just do a flush and read, OR calculate from the current object which might not reflect concurrent updates.
        // Actually, checking count(*) of reports in the DB for this confession is the most accurate way.
        long totalReports = reportRepository.countByConfessionId(confessionId);

        if (totalReports >= hideThreshold) {
            int updated = confessionRepository.updateStatusIfPublished(confessionId, ConfessionStatus.HIDDEN);

            if (updated > 0) {
                AuditLog log = new AuditLog();
                log.setAdmin(null);
                log.setAction(AuditAction.HIDE_CONFESSION);
                log.setTargetType("CONFESSION");
                log.setTargetId(confessionId);
                log.setDetails("Automatically hidden after reaching report threshold of " + hideThreshold);
                auditLogRepository.save(log);
            }
        }

        return new ReportResponse("Report submitted successfully.");
    }
}
