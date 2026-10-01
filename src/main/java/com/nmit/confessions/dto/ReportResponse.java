package com.nmit.confessions.dto;

public class ReportResponse {
    private String message;

    public ReportResponse(String message) {
        this.message = message;
    }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
