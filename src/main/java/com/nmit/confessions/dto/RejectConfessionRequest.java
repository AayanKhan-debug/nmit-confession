package com.nmit.confessions.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RejectConfessionRequest {

    @NotBlank(message = "Rejection reason is required")
    @Size(max = 500, message = "Reason must not exceed 500 characters")
    private String reason;

    public String getReason() {
        return reason != null ? reason.trim() : null;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
