package com.nmit.confessions.dto;

import com.nmit.confessions.enums.ConfessionCategory;
import com.nmit.confessions.enums.ConfessionStatus;
import com.nmit.confessions.enums.ReportReason;
import com.nmit.confessions.enums.ReportStatus;

import java.time.Instant;

public class AdminReportResponse {
    private Long id;
    private ReportReason reason;
    private ReportStatus status;
    private Instant createdAt;
    private Instant resolvedAt;

    private Long confessionId;
    private String confessionTitle;
    private String confessionContent;
    private ConfessionCategory confessionCategory;
    private ConfessionStatus confessionStatus;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public ReportReason getReason() { return reason; }
    public void setReason(ReportReason reason) { this.reason = reason; }

    public ReportStatus getStatus() { return status; }
    public void setStatus(ReportStatus status) { this.status = status; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(Instant resolvedAt) { this.resolvedAt = resolvedAt; }

    public Long getConfessionId() { return confessionId; }
    public void setConfessionId(Long confessionId) { this.confessionId = confessionId; }

    public String getConfessionTitle() { return confessionTitle; }
    public void setConfessionTitle(String confessionTitle) { this.confessionTitle = confessionTitle; }

    public String getConfessionContent() { return confessionContent; }
    public void setConfessionContent(String confessionContent) { this.confessionContent = confessionContent; }

    public ConfessionCategory getConfessionCategory() { return confessionCategory; }
    public void setConfessionCategory(ConfessionCategory confessionCategory) { this.confessionCategory = confessionCategory; }

    public ConfessionStatus getConfessionStatus() { return confessionStatus; }
    public void setConfessionStatus(ConfessionStatus confessionStatus) { this.confessionStatus = confessionStatus; }
}
