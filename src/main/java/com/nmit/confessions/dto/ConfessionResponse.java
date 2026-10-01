package com.nmit.confessions.dto;

public class ConfessionResponse {
    private String message;

    public ConfessionResponse(String message) {
        this.message = message;
    }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
