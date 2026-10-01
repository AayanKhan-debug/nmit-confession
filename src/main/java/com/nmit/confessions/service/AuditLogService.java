package com.nmit.confessions.service;

import com.nmit.confessions.dto.AuditLogResponse;
import com.nmit.confessions.entity.AuditLog;
import com.nmit.confessions.repository.AuditLogRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public AuditLogService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    public Page<AuditLogResponse> getAuditLogs(int page, int size) {
        int boundedSize = Math.min(size, 50);
        Pageable pageable = PageRequest.of(page, boundedSize, Sort.by("createdAt").descending());
        
        Page<AuditLog> logs = auditLogRepository.findAll(pageable);
        return logs.map(this::mapToResponse);
    }

    private AuditLogResponse mapToResponse(AuditLog log) {
        AuditLogResponse dto = new AuditLogResponse();
        dto.setId(log.getId());
        dto.setAdminUsername(log.getAdmin().getUsername());
        dto.setAction(log.getAction());
        dto.setTargetType(log.getTargetType());
        dto.setTargetId(log.getTargetId());
        dto.setDetails(log.getDetails());
        dto.setCreatedAt(log.getCreatedAt());
        return dto;
    }
}
