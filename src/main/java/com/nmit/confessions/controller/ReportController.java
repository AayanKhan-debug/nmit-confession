package com.nmit.confessions.controller;

import com.nmit.confessions.dto.CreateReportRequest;
import com.nmit.confessions.dto.ReportResponse;
import com.nmit.confessions.service.DeviceTokenService;
import com.nmit.confessions.service.ReportService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/confessions/{id}/reports")
public class ReportController {

    private final ReportService reportService;
    private final DeviceTokenService deviceTokenService;

    public ReportController(ReportService reportService, DeviceTokenService deviceTokenService) {
        this.reportService = reportService;
        this.deviceTokenService = deviceTokenService;
    }

    @PostMapping
    public ResponseEntity<?> submitReport(
            @PathVariable Long id,
            @Valid @RequestBody CreateReportRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        try {
            String token = deviceTokenService.getOrCreateDeviceToken(httpRequest, httpResponse);
            ReportResponse response = reportService.submitReport(id, request, token);
            return ResponseEntity.ok(response);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(e.getMessage());
        }
    }
}
