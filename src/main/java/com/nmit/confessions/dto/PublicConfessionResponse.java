package com.nmit.confessions.dto;

import com.nmit.confessions.enums.ConfessionCategory;
import java.time.Instant;
import java.util.Map;

public class PublicConfessionResponse {
    private Long id;
    private String title;
    private String content;
    private ConfessionCategory category;
    private Instant createdAt;
    private Map<String, Integer> reactions;

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public ConfessionCategory getCategory() { return category; }
    public void setCategory(ConfessionCategory category) { this.category = category; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Map<String, Integer> getReactions() { return reactions; }
    public void setReactions(Map<String, Integer> reactions) { this.reactions = reactions; }
}
