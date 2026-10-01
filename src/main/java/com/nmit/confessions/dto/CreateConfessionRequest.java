package com.nmit.confessions.dto;

import com.nmit.confessions.enums.ConfessionCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class CreateConfessionRequest {

    @Size(max = 120)
    private String title;

    @NotBlank
    @Size(min = 10, max = 2000)
    private String content;

    @NotNull
    private ConfessionCategory category;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public ConfessionCategory getCategory() { return category; }
    public void setCategory(ConfessionCategory category) { this.category = category; }
}
