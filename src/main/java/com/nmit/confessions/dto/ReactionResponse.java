package com.nmit.confessions.dto;

public class ReactionResponse {
    private String message;
    
    public ReactionResponse(String message) {
        this.message = message;
    }
    
    public String getMessage() {
        return message;
    }
}
