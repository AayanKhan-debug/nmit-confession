package com.nmit.confessions.controller;

import com.nmit.confessions.dto.AdminInfoResponse;
import com.nmit.confessions.dto.LoginRequest;
import com.nmit.confessions.dto.LoginResponse;
import com.nmit.confessions.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request, 
                                               HttpServletRequest httpRequest, 
                                               HttpServletResponse httpResponse) {
        LoginResponse response = authService.authenticate(request, httpRequest, httpResponse);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<AdminInfoResponse> me() {
        return ResponseEntity.ok(authService.getCurrentAdminInfo());
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request, HttpServletResponse response) {
        authService.logout(request, response);
        return ResponseEntity.noContent().build();
    }
}
