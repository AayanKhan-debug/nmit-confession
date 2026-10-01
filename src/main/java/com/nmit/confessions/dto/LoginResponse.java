package com.nmit.confessions.dto;

import com.nmit.confessions.enums.AdminRole;

public class LoginResponse {
    private String message;
    private String username;
    private AdminRole role;

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public AdminRole getRole() { return role; }
    public void setRole(AdminRole role) { this.role = role; }
}
