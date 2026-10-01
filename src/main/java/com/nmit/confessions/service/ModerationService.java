package com.nmit.confessions.service;

import com.nmit.confessions.dto.ModerationActionResponse;
import com.nmit.confessions.dto.ModerationQueueItemResponse;
import com.nmit.confessions.entity.Admin;
import com.nmit.confessions.entity.AuditLog;
import com.nmit.confessions.entity.Confession;
import com.nmit.confessions.enums.AuditAction;
import com.nmit.confessions.enums.ConfessionStatus;
import com.nmit.confessions.enums.ScreeningFlag;
import com.nmit.confessions.exception.InvalidModerationStateException;
import com.nmit.confessions.exception.ResourceNotFoundException;
import com.nmit.confessions.repository.AdminRepository;
import com.nmit.confessions.repository.AuditLogRepository;
import com.nmit.confessions.repository.ConfessionRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ModerationService {

    private final ConfessionRepository confessionRepository;
    private final AdminRepository adminRepository;
    private final AuditLogRepository auditLogRepository;

    public ModerationService(ConfessionRepository confessionRepository, 
                             AdminRepository adminRepository, 
                             AuditLogRepository auditLogRepository) {
        this.confessionRepository = confessionRepository;
        this.adminRepository = adminRepository;
        this.auditLogRepository = auditLogRepository;
    }

    public Page<ModerationQueueItemResponse> getModerationQueue(ConfessionStatus status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Confession> confessions = confessionRepository.findByStatus(status, pageable);
        return confessions.map(this::mapToQueueItemResponse);
    }

    public Page<ModerationQueueItemResponse> getHiddenConfessions(int page, int size) {
        return getModerationQueue(ConfessionStatus.HIDDEN, page, size);
    }

    private ModerationQueueItemResponse mapToQueueItemResponse(Confession confession) {
        ModerationQueueItemResponse response = new ModerationQueueItemResponse();
        response.setId(confession.getId());
        response.setTitle(confession.getTitle());
        response.setContent(confession.getContent());
        response.setCategory(confession.getCategory());
        response.setStatus(confession.getStatus());
        response.setCreatedAt(confession.getCreatedAt());
        
        response.setScreeningFlags(confession.getScreeningFlags());
        
        return response;
    }

    @Transactional
    public ModerationActionResponse approveConfession(Long id, String adminUsername) {
        Confession confession = confessionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Confession not found"));

        if (confession.getStatus() != ConfessionStatus.PENDING) {
            throw new InvalidModerationStateException("Only PENDING confessions can be approved.");
        }

        Admin admin = adminRepository.findByUsername(adminUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));

        confession.setStatus(ConfessionStatus.PUBLISHED);
        confession.setModeratedBy(admin);
        confession.setModeratedAt(Instant.now());
        if (confession.getStatus() == ConfessionStatus.PUBLISHED) { confession.setPublishedAt(Instant.now()); }
        confessionRepository.save(confession);

        createAuditLog(admin, AuditAction.APPROVE_CONFESSION, confession.getId(), null);

        return new ModerationActionResponse("Confession approved.", confession.getId(), ConfessionStatus.PUBLISHED);
    }

    @Transactional
    public ModerationActionResponse rejectConfession(Long id, String reason, String adminUsername) {
        Confession confession = confessionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Confession not found"));

        if (confession.getStatus() != ConfessionStatus.PENDING && confession.getStatus() != ConfessionStatus.HIDDEN) {
            throw new InvalidModerationStateException("Only PENDING or HIDDEN confessions can be rejected.");
        }

        Admin admin = adminRepository.findByUsername(adminUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));

        confession.setStatus(ConfessionStatus.REJECTED);
        confession.setRejectionReason(reason);
        confession.setModeratedBy(admin);
        confession.setModeratedAt(Instant.now());
        if (confession.getStatus() == ConfessionStatus.PUBLISHED) { confession.setPublishedAt(Instant.now()); }
        confessionRepository.save(confession);

        createAuditLog(admin, AuditAction.REJECT_CONFESSION, confession.getId(), "Reason: " + reason);

        return new ModerationActionResponse("Confession rejected.", confession.getId(), ConfessionStatus.REJECTED);
    }

    @Transactional
    public ModerationActionResponse restoreConfession(Long id, String adminUsername) {
        Confession confession = confessionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Confession not found"));

        if (confession.getStatus() != ConfessionStatus.HIDDEN) {
            throw new InvalidModerationStateException("Only HIDDEN confessions can be restored.");
        }

        Admin admin = adminRepository.findByUsername(adminUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));

        confession.setStatus(ConfessionStatus.PUBLISHED);
        confession.setModeratedBy(admin);
        confession.setModeratedAt(Instant.now());
        if (confession.getStatus() == ConfessionStatus.PUBLISHED) { confession.setPublishedAt(Instant.now()); }
        confessionRepository.save(confession);

        createAuditLog(admin, AuditAction.RESTORE_CONFESSION, confession.getId(), null);

        return new ModerationActionResponse("Confession restored.", confession.getId(), ConfessionStatus.PUBLISHED);
    }

    private void createAuditLog(Admin admin, AuditAction action, Long targetId, String details) {
        AuditLog log = new AuditLog();
        log.setAdmin(admin);
        log.setAction(action);
        log.setTargetType("CONFESSION");
        log.setTargetId(targetId);
        log.setDetails(details);
        auditLogRepository.save(log);
    }
}
