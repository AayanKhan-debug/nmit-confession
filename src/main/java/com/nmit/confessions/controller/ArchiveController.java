package com.nmit.confessions.controller;

import com.nmit.confessions.dto.PublicConfessionResponse;
import com.nmit.confessions.enums.ConfessionCategory;
import com.nmit.confessions.service.ArchiveService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/confessions/archive")
public class ArchiveController {

    private final ArchiveService archiveService;

    public ArchiveController(ArchiveService archiveService) {
        this.archiveService = archiveService;
    }

    @GetMapping("/day/{date}")
    public ResponseEntity<Page<PublicConfessionResponse>> getDailyArchive(
            @PathVariable String date,
            @RequestParam(required = false) ConfessionCategory category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(archiveService.getDailyArchive(date, category, page, size));
    }

    @GetMapping("/week/{year}/{week}")
    public ResponseEntity<Page<PublicConfessionResponse>> getWeeklyArchive(
            @PathVariable int year,
            @PathVariable int week,
            @RequestParam(required = false) ConfessionCategory category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(archiveService.getWeeklyArchive(year, week, category, page, size));
    }

    @GetMapping("/month/{year}/{month}")
    public ResponseEntity<Page<PublicConfessionResponse>> getMonthlyArchive(
            @PathVariable int year,
            @PathVariable int month,
            @RequestParam(required = false) ConfessionCategory category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(archiveService.getMonthlyArchive(year, month, category, page, size));
    }
}
