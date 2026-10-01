package com.nmit.confessions.service;

import com.nmit.confessions.dto.AdminDashboardResponse;
import com.nmit.confessions.dto.AuditActivityResponse;
import com.nmit.confessions.entity.AuditLog;
import com.nmit.confessions.enums.ConfessionCategory;
import com.nmit.confessions.enums.ConfessionStatus;
import com.nmit.confessions.enums.ReportStatus;
import com.nmit.confessions.enums.ScreeningFlag;
import com.nmit.confessions.repository.AuditLogRepository;
import com.nmit.confessions.repository.ConfessionRepository;
import com.nmit.confessions.repository.ReportRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AdminDashboardService {
    
    private final ConfessionRepository confessionRepository;
    private final ReportRepository reportRepository;
    private final AuditLogRepository auditLogRepository;
    
    public AdminDashboardService(ConfessionRepository confessionRepository, ReportRepository reportRepository, AuditLogRepository auditLogRepository) {
        this.confessionRepository = confessionRepository;
        this.reportRepository = reportRepository;
        this.auditLogRepository = auditLogRepository;
    }
    
    public AdminDashboardResponse getDashboardMetrics() {
        AdminDashboardResponse response = new AdminDashboardResponse();
        
        response.setPendingConfessions(confessionRepository.countByStatus(ConfessionStatus.PENDING));
        response.setHiddenConfessions(confessionRepository.countByStatus(ConfessionStatus.HIDDEN));
        response.setPublishedConfessions(confessionRepository.countByStatus(ConfessionStatus.PUBLISHED));
        response.setRejectedConfessions(confessionRepository.countByStatus(ConfessionStatus.REJECTED));
        
        response.setFlaggedPendingConfessions(confessionRepository.countByStatusAndScreeningFlagsIsNotEmpty(ConfessionStatus.PENDING));
        
        response.setPendingReports(reportRepository.countByStatus(ReportStatus.PENDING));
        
        // Aggregate flag counts
        List<Object[]> flagResults = confessionRepository.countScreeningFlagsByStatus(ConfessionStatus.PENDING);
        Map<String, Long> flagCounts = new HashMap<>();
        for (Object[] result : flagResults) {
            ScreeningFlag flag = (ScreeningFlag) result[0];
            Long count = (Long) result[1];
            flagCounts.put(flag.name(), count);
        }
        response.setFlagCounts(flagCounts);
        
        // Aggregate category counts
        List<Object[]> categoryResults = confessionRepository.countByCategoryAndStatus(ConfessionStatus.PENDING);
        Map<String, Long> categoryCounts = new HashMap<>();
        for (Object[] result : categoryResults) {
            ConfessionCategory category = (ConfessionCategory) result[0];
            Long count = (Long) result[1];
            categoryCounts.put(category.name(), count);
        }
        response.setCategoryCounts(categoryCounts);
        
        // Recent activity
        List<AuditLog> recentLogs = auditLogRepository.findTop10ByOrderByCreatedAtDescIdDesc();
        List<AuditActivityResponse> recentActivity = recentLogs.stream().map(log -> {
            AuditActivityResponse act = new AuditActivityResponse();
            act.setAction(log.getAction().name());
            act.setTargetType(log.getTargetType());
            if (log.getTargetId() != null) {
                act.setTargetId(String.valueOf(log.getTargetId()));
            }
            act.setCreatedAt(log.getCreatedAt());
            if (log.getAdmin() != null) {
                act.setUsername(log.getAdmin().getUsername());
            }
            return act;
        }).collect(Collectors.toList());
        
        response.setRecentActivity(recentActivity);
        
        return response;
    }
}
