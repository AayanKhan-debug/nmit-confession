package com.nmit.confessions.dto;

import com.nmit.confessions.enums.ReportReason;
import jakarta.validation.constraints.NotNull;

public class CreateReportRequest {
    
    @NotNull(message = "Report reason is required")
    private ReportReason reason;

    public ReportReason getReason() { return reason; }
    public void setReason(ReportReason reason) { this.reason = reason; }
}
