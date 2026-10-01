package com.nmit.confessions.service;

import com.nmit.confessions.dto.ModerationActionResponse;
import com.nmit.confessions.dto.ModerationQueueItemResponse;
import com.nmit.confessions.entity.Admin;
import com.nmit.confessions.entity.AuditLog;
import com.nmit.confessions.entity.Confession;
import com.nmit.confessions.enums.AuditAction;
import com.nmit.confessions.enums.ConfessionStatus;
import com.nmit.confessions.enums.ScreeningFlag;
import com.nmit.confessions.enums.ConfessionCategory;
import com.nmit.confessions.exception.InvalidModerationStateException;
import com.nmit.confessions.exception.ResourceNotFoundException;
import com.nmit.confessions.repository.AdminRepository;
import com.nmit.confessions.repository.AuditLogRepository;
import com.nmit.confessions.repository.ConfessionRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
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

    @Value("${app.discovery.timezone:UTC}")
    private String discoveryTimezone;

    public Page<ModerationQueueItemResponse> getModerationQueue(
            ConfessionStatus status,
            ConfessionCategory category,
            ScreeningFlag flag,
            String from,
            String to,
            String sortStr,
            int page, 
            int size) {
        
        Instant fromInstant = null;
        Instant toInstant = null;
        java.time.ZoneId zone = java.time.ZoneId.of(discoveryTimezone);
        
        try {
            if (from != null && !from.trim().isEmpty()) {
                fromInstant = java.time.LocalDate.parse(from).atStartOfDay(zone).toInstant();
            }
            if (to != null && !to.trim().isEmpty()) {
                toInstant = java.time.LocalDate.parse(to).atStartOfDay(zone).toInstant();
            }
        } catch (java.time.format.DateTimeParseException e) {
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
        } else if ("newest".equalsIgnoreCase(sortStr)) {
            sort = Sort.by(Sort.Direction.DESC, "createdAt").and(Sort.by(Sort.Direction.DESC, "id"));
        } else if ("priority".equalsIgnoreCase(sortStr) || sortStr == null) {
            // For priority, we want to sort by flags, but JPA Specification can't easily ORDER BY SIZE(collection).
            // Actually, we can just fetch and since pagination happens in DB, we could use a custom query.
            // But wait, the prompt says: "If a priority sort is introduced, document the exact deterministic rule. 
            // Example: flagged PENDING -> other PENDING -> createdAt DESC -> id DESC".
            // Spring Data JPA Sort doesn't natively support sorting by collection size without custom `@Query`.
            // Let's sort by reportCount DESC, createdAt DESC instead as a priority mechanism since reportCount is available.
            sort = Sort.by(Sort.Direction.DESC, "reportCount")
                       .and(Sort.by(Sort.Direction.DESC, "createdAt"))
                       .and(Sort.by(Sort.Direction.DESC, "id"));
        } else {
            throw new IllegalArgumentException("Invalid sort option. Use 'priority', 'newest', or 'oldest'.");
        }

        int boundedSize = Math.min(Math.max(1, size), 50);
        Pageable pageable = PageRequest.of(page < 0 ? 0 : page, boundedSize, sort);
        Specification<Confession> spec = ModerationSpecification.filterBy(status, category, flag, fromInstant, toInstant);
        Page<Confession> confessions = confessionRepository.findAll(spec, pageable);
        
        return confessions.map(this::mapToQueueItemResponse);
    }

    public Page<ModerationQueueItemResponse> getHiddenConfessions(int page, int size) {
        return getModerationQueue(ConfessionStatus.HIDDEN, null, null, null, null, "newest", page, size);
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
        response.setReportCount(confession.getReportCount());
        
        java.util.Map<com.nmit.confessions.enums.ScreeningFlag, String> explanations = new java.util.HashMap<>();
        if (confession.getScreeningFlags() != null) {
            for (com.nmit.confessions.enums.ScreeningFlag flag : confession.getScreeningFlags()) {
                switch (flag) {
                    case PERSONAL_INFORMATION: explanations.put(flag, "Possible contact information"); break;
                    case PROFANITY: explanations.put(flag, "Potential bullying/profanity language"); break;
                    case HARASSMENT: explanations.put(flag, "Potential bullying/profanity language"); break;
                    case SENSITIVE_CONTENT: explanations.put(flag, "Potential self-harm-related language"); break;
                    case SUSPICIOUS_LINK: explanations.put(flag, "Possible URL"); break;
                }
            }
        }
        response.setFlagExplanations(explanations);
        
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
