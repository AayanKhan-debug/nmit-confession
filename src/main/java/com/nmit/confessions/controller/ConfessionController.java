package com.nmit.confessions.controller;

import com.nmit.confessions.dto.ConfessionResponse;
import com.nmit.confessions.dto.CreateConfessionRequest;
import com.nmit.confessions.exception.RateLimitExceededException;
import com.nmit.confessions.service.ConfessionService;
import com.nmit.confessions.service.DeviceTokenService;
import com.nmit.confessions.service.RateLimitService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/confessions")
public class ConfessionController {

    private final ConfessionService confessionService;
    private final RateLimitService rateLimitService;
    private final DeviceTokenService deviceTokenService;

    public ConfessionController(ConfessionService confessionService, 
                                RateLimitService rateLimitService,
                                DeviceTokenService deviceTokenService) {
        this.confessionService = confessionService;
        this.rateLimitService = rateLimitService;
        this.deviceTokenService = deviceTokenService;
    }

    @PostMapping
    public ResponseEntity<ConfessionResponse> submitConfession(
            @Valid @RequestBody CreateConfessionRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        
        String ipAddress = httpRequest.getRemoteAddr();
        String forwardedFor = httpRequest.getHeader("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isEmpty()) {
            ipAddress = forwardedFor.split(",")[0];
        }

        if (!rateLimitService.isAllowed(ipAddress)) {
            throw new RateLimitExceededException("Too many requests. Please try again later.");
        }

        deviceTokenService.getOrCreateDeviceToken(httpRequest, httpResponse);

        confessionService.submitConfession(request);

        return ResponseEntity.status(HttpStatus.ACCEPTED)
                .body(new ConfessionResponse("Confession submitted for moderation."));
    }
}
