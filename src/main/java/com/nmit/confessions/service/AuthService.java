package com.nmit.confessions.service;

import com.nmit.confessions.dto.AdminInfoResponse;
import com.nmit.confessions.dto.LoginRequest;
import com.nmit.confessions.dto.LoginResponse;
import com.nmit.confessions.entity.Admin;
import com.nmit.confessions.repository.AdminRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.context.SecurityContextHolderStrategy;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final AdminRepository adminRepository;
    private final SecurityContextRepository securityContextRepository = new HttpSessionSecurityContextRepository();
    private final SecurityContextHolderStrategy securityContextHolderStrategy = SecurityContextHolder.getContextHolderStrategy();
    private final SecurityContextLogoutHandler logoutHandler = new SecurityContextLogoutHandler();

    public AuthService(AuthenticationManager authenticationManager, AdminRepository adminRepository) {
        this.authenticationManager = authenticationManager;
        this.adminRepository = adminRepository;
    }

    public LoginResponse authenticate(LoginRequest loginRequest, HttpServletRequest request, HttpServletResponse response) {
        try {
            UsernamePasswordAuthenticationToken token = UsernamePasswordAuthenticationToken.unauthenticated(
                    loginRequest.getUsername(), loginRequest.getPassword());
            Authentication authentication = authenticationManager.authenticate(token);

            SecurityContext context = securityContextHolderStrategy.createEmptyContext();
            context.setAuthentication(authentication);
            securityContextHolderStrategy.setContext(context);
            securityContextRepository.saveContext(context, request, response);

            Admin admin = adminRepository.findByUsername(loginRequest.getUsername())
                    .orElseThrow(() -> new RuntimeException("Admin not found after authentication"));

            LoginResponse loginResponse = new LoginResponse();
            loginResponse.setMessage("Login successful");
            loginResponse.setUsername(admin.getUsername());
            loginResponse.setRole(admin.getRole());
            return loginResponse;

        } catch (org.springframework.security.core.AuthenticationException e) {
            throw new BadCredentialsException("Invalid username or password");
        }
    }

    public AdminInfoResponse getCurrentAdminInfo() {
        Authentication authentication = securityContextHolderStrategy.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication.getPrincipal().equals("anonymousUser")) {
            throw new BadCredentialsException("Not authenticated");
        }
        
        String username = authentication.getName();
        Admin admin = adminRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        AdminInfoResponse response = new AdminInfoResponse();
        response.setUsername(admin.getUsername());
        response.setRole(admin.getRole());
        return response;
    }

    public void logout(HttpServletRequest request, HttpServletResponse response) {
        Authentication authentication = securityContextHolderStrategy.getContext().getAuthentication();
        if (authentication != null) {
            logoutHandler.logout(request, response, authentication);
        }
    }
}
