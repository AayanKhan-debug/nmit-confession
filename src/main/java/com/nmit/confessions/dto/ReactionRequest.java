package com.nmit.confessions.dto;

import com.nmit.confessions.enums.ReactionType;
import jakarta.validation.constraints.NotNull;

public class ReactionRequest {
    
    @NotNull(message = "Reaction type is required")
    private ReactionType type;

    public ReactionType getType() {
        return type;
    }

    public void setType(ReactionType type) {
        this.type = type;
    }
}
