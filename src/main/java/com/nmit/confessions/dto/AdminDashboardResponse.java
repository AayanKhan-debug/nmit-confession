package com.nmit.confessions.dto;

import java.util.List;
import java.util.Map;

public class AdminDashboardResponse {
    private long pendingConfessions;
    private long flaggedPendingConfessions;
    private long pendingReports;
    private long hiddenConfessions;
    private long publishedConfessions;
    private long rejectedConfessions;
    private Map<String, Long> flagCounts;
    private Map<String, Long> categoryCounts;
    private List<AuditActivityResponse> recentActivity;

    public long getPendingConfessions() { return pendingConfessions; }
    public void setPendingConfessions(long pendingConfessions) { this.pendingConfessions = pendingConfessions; }

    public long getFlaggedPendingConfessions() { return flaggedPendingConfessions; }
    public void setFlaggedPendingConfessions(long flaggedPendingConfessions) { this.flaggedPendingConfessions = flaggedPendingConfessions; }

    public long getPendingReports() { return pendingReports; }
    public void setPendingReports(long pendingReports) { this.pendingReports = pendingReports; }

    public long getHiddenConfessions() { return hiddenConfessions; }
    public void setHiddenConfessions(long hiddenConfessions) { this.hiddenConfessions = hiddenConfessions; }

    public long getPublishedConfessions() { return publishedConfessions; }
    public void setPublishedConfessions(long publishedConfessions) { this.publishedConfessions = publishedConfessions; }

    public long getRejectedConfessions() { return rejectedConfessions; }
    public void setRejectedConfessions(long rejectedConfessions) { this.rejectedConfessions = rejectedConfessions; }

    public Map<String, Long> getFlagCounts() { return flagCounts; }
    public void setFlagCounts(Map<String, Long> flagCounts) { this.flagCounts = flagCounts; }

    public Map<String, Long> getCategoryCounts() { return categoryCounts; }
    public void setCategoryCounts(Map<String, Long> categoryCounts) { this.categoryCounts = categoryCounts; }

    public List<AuditActivityResponse> getRecentActivity() { return recentActivity; }
    public void setRecentActivity(List<AuditActivityResponse> recentActivity) { this.recentActivity = recentActivity; }
}
