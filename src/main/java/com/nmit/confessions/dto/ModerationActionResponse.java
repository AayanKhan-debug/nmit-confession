package com.nmit.confessions.dto;

import com.nmit.confessions.enums.ConfessionStatus;

public class ModerationActionResponse {
    private String message;
    private Long id;
    private ConfessionStatus status;

    public ModerationActionResponse(String message, Long id, ConfessionStatus status) {
        this.message = message;
        this.id = id;
        this.status = status;
    }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public ConfessionStatus getStatus() { return status; }
    public void setStatus(ConfessionStatus status) { this.status = status; }
}
