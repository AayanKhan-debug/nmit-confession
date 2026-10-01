package com.nmit.confessions.controller;

import com.nmit.confessions.dto.AdminReportResponse;
import com.nmit.confessions.dto.ModerationActionResponse;
import com.nmit.confessions.enums.ConfessionStatus;
import com.nmit.confessions.enums.ReportReason;
import com.nmit.confessions.enums.ReportStatus;
import com.nmit.confessions.service.AdminReportService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/reports")
@PreAuthorize("hasAnyRole('ADMIN', 'MODERATOR')")
public class AdminReportController {

    private final AdminReportService adminReportService;

    public AdminReportController(AdminReportService adminReportService) {
        this.adminReportService = adminReportService;
    }

    @GetMapping
    public ResponseEntity<Page<AdminReportResponse>> getReports(
            @RequestParam(required = false) ReportStatus status,
            @RequestParam(required = false) ReportReason reason,
            @RequestParam(required = false) ConfessionStatus confessionStatus,
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to,
            @RequestParam(defaultValue = "newest") String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        size = Math.min(size, 50);
        Page<AdminReportResponse> result = adminReportService.getReports(status, reason, confessionStatus, from, to, sort, page, size);
        return ResponseEntity.ok(result);
    }

    @PatchMapping("/{id}/resolve")
    public ResponseEntity<ModerationActionResponse> resolveReport(
            @PathVariable Long id,
            Authentication authentication) {
        ModerationActionResponse response = adminReportService.resolveReport(id, authentication.getName());
        return ResponseEntity.ok(response);
    }
}
