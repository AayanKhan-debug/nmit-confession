package com.nmit.confessions.controller;

import com.nmit.confessions.dto.PublicConfessionResponse;
import com.nmit.confessions.enums.ConfessionCategory;
import com.nmit.confessions.service.PublicConfessionService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/confessions")
public class PublicConfessionController {

    private final PublicConfessionService publicConfessionService;

    public PublicConfessionController(PublicConfessionService publicConfessionService) {
        this.publicConfessionService = publicConfessionService;
    }

    @GetMapping
    public ResponseEntity<Page<PublicConfessionResponse>> getPublicFeed(
            @RequestParam(required = false) ConfessionCategory category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Page<PublicConfessionResponse> feed = publicConfessionService.getPublicFeed(category, page, size);
        return ResponseEntity.ok(feed);
    }
}
