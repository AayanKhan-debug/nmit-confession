package com.nmit.confessions.dto;

import com.nmit.confessions.enums.AdminRole;

public class AdminInfoResponse {
    private String username;
    private AdminRole role;

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public AdminRole getRole() { return role; }
    public void setRole(AdminRole role) { this.role = role; }
}
