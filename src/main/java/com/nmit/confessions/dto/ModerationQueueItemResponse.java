package com.nmit.confessions.dto;

import com.nmit.confessions.enums.ConfessionCategory;
import com.nmit.confessions.enums.ConfessionStatus;
import com.nmit.confessions.enums.ScreeningFlag;
import java.time.Instant;
import java.util.Set;

public class ModerationQueueItemResponse {
    private Long id;
    private String title;
    private String content;
    private ConfessionCategory category;
    private ConfessionStatus status;
    private Set<ScreeningFlag> screeningFlags;
    private Instant createdAt;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public ConfessionCategory getCategory() { return category; }
    public void setCategory(ConfessionCategory category) { this.category = category; }

    public ConfessionStatus getStatus() { return status; }
    public void setStatus(ConfessionStatus status) { this.status = status; }

    public Set<ScreeningFlag> getScreeningFlags() { return screeningFlags; }
    public void setScreeningFlags(Set<ScreeningFlag> screeningFlags) { this.screeningFlags = screeningFlags; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
