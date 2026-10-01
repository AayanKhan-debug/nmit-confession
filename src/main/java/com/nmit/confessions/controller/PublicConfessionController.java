package com.nmit.confessions.controller;

import com.nmit.confessions.dto.PublicConfessionResponse;
import com.nmit.confessions.enums.ConfessionCategory;
import com.nmit.confessions.service.DiscoveryService;
import com.nmit.confessions.service.SearchService;
import com.nmit.confessions.service.TrendingService;
import com.nmit.confessions.service.DailyConfessionService;
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
    private final DiscoveryService discoveryService;
    private final SearchService searchService;
    private final TrendingService trendingService;
    private final DailyConfessionService dailyConfessionService;

    public PublicConfessionController(PublicConfessionService publicConfessionService, DiscoveryService discoveryService, SearchService searchService, TrendingService trendingService, DailyConfessionService dailyConfessionService) {
        this.publicConfessionService = publicConfessionService;
        this.discoveryService = discoveryService;
        this.searchService = searchService;
        this.trendingService = trendingService;
        this.dailyConfessionService = dailyConfessionService;
    }

    @GetMapping
    public ResponseEntity<Page<PublicConfessionResponse>> getPublicFeed(
            @RequestParam(required = false) ConfessionCategory category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Page<PublicConfessionResponse> feed = publicConfessionService.getPublicFeed(category, page, size);
        return ResponseEntity.ok(feed);
    }

    @GetMapping("/discover")
    public ResponseEntity<Page<PublicConfessionResponse>> discover(
            @RequestParam String from,
            @RequestParam String to,
            @RequestParam(required = false) ConfessionCategory category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Page<PublicConfessionResponse> feed = discoveryService.discover(from, to, category, page, size);
        return ResponseEntity.ok(feed);
    }

    @GetMapping("/discover/today")
    public ResponseEntity<Page<PublicConfessionResponse>> discoverToday(
            @RequestParam(required = false) ConfessionCategory category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Page<PublicConfessionResponse> feed = discoveryService.discoverToday(category, page, size);
        return ResponseEntity.ok(feed);
    }

    @GetMapping("/search")
    public ResponseEntity<Page<PublicConfessionResponse>> search(
            @RequestParam String q,
            @RequestParam(required = false) ConfessionCategory category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Page<PublicConfessionResponse> feed = searchService.search(q, category, page, size);
        return ResponseEntity.ok(feed);
    }

    @GetMapping("/trending")
    public ResponseEntity<Page<PublicConfessionResponse>> trending(
            @RequestParam(required = false) ConfessionCategory category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Page<PublicConfessionResponse> feed = trendingService.getTrending(category, page, size);
        return ResponseEntity.ok(feed);
    }

    @GetMapping("/daily")
    public ResponseEntity<PublicConfessionResponse> getDailyConfession() {
        return dailyConfessionService.getDailyConfession()
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
