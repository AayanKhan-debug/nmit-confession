package com.nmit.confessions.controller;

import com.nmit.confessions.dto.ModerationActionResponse;
import com.nmit.confessions.dto.ModerationQueueItemResponse;
import com.nmit.confessions.dto.RejectConfessionRequest;
import com.nmit.confessions.enums.ConfessionStatus;
import com.nmit.confessions.service.ModerationService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/admin/moderation")
public class ModerationController {

    private final ModerationService moderationService;

    public ModerationController(ModerationService moderationService) {
        this.moderationService = moderationService;
    }

    @GetMapping("/confessions")
    @PreAuthorize("hasAnyRole('ADMIN', 'MODERATOR')")
    public ResponseEntity<Page<ModerationQueueItemResponse>> getModerationQueue(
            @RequestParam(defaultValue = "PENDING") ConfessionStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        size = Math.min(size, 50);
        Page<ModerationQueueItemResponse> result = moderationService.getModerationQueue(status, page, size);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/hidden")
    @PreAuthorize("hasAnyRole('ADMIN', 'MODERATOR')")
    public ResponseEntity<Page<ModerationQueueItemResponse>> getHiddenConfessions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        size = Math.min(size, 50);
        Page<ModerationQueueItemResponse> result = moderationService.getHiddenConfessions(page, size);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/confessions/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN', 'MODERATOR')")
    public ResponseEntity<ModerationActionResponse> approveConfession(@PathVariable Long id, Principal principal) {
        ModerationActionResponse response = moderationService.approveConfession(id, principal.getName());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/confessions/{id}/reject")
    @PreAuthorize("hasAnyRole('ADMIN', 'MODERATOR')")
    public ResponseEntity<ModerationActionResponse> rejectConfession(
            @PathVariable Long id, 
            @Valid @RequestBody RejectConfessionRequest request, 
            Principal principal) {
        ModerationActionResponse response = moderationService.rejectConfession(id, request.getReason(), principal.getName());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/confessions/{id}/restore")
    @PreAuthorize("hasAnyRole('ADMIN', 'MODERATOR')")
    public ResponseEntity<ModerationActionResponse> restoreConfession(@PathVariable Long id, Principal principal) {
        ModerationActionResponse response = moderationService.restoreConfession(id, principal.getName());
        return ResponseEntity.ok(response);
    }
}
