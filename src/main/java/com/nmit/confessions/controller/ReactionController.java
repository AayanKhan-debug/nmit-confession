package com.nmit.confessions.controller;

import com.nmit.confessions.dto.ReactionRequest;
import com.nmit.confessions.dto.ReactionResponse;
import com.nmit.confessions.service.DeviceTokenService;
import com.nmit.confessions.service.ReactionService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/confessions/{id}/reactions")
public class ReactionController {

    private final ReactionService reactionService;
    private final DeviceTokenService deviceTokenService;

    public ReactionController(ReactionService reactionService, DeviceTokenService deviceTokenService) {
        this.reactionService = reactionService;
        this.deviceTokenService = deviceTokenService;
    }

    @PostMapping
    public ResponseEntity<ReactionResponse> addReaction(
            @PathVariable Long id,
            @Valid @RequestBody ReactionRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        
        String token = deviceTokenService.getOrCreateDeviceToken(httpRequest, httpResponse);
        ReactionResponse response = reactionService.addReaction(id, request.getType(), token);
        return ResponseEntity.ok(response);
    }
}
