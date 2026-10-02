package com.nmit.confessions.config;

import com.nmit.confessions.entity.Admin;
import com.nmit.confessions.enums.AdminRole;
import com.nmit.confessions.repository.AdminRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DatabaseSeeder.class);

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    private final String initialUsername;
    private final String initialPassword;

    public DatabaseSeeder(
            AdminRepository adminRepository,
            PasswordEncoder passwordEncoder,
            @Value("${app.admin.initial-username:${ADMIN_INITIAL_USERNAME:}}") String initialUsername,
            @Value("${app.admin.initial-password:${ADMIN_INITIAL_PASSWORD:}}") String initialPassword) {
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
        this.initialUsername = initialUsername;
        this.initialPassword = initialPassword;
    }

    @Override
    public void run(String... args) {
        seedInitialAdmin();
    }

    public void seedInitialAdmin() {
        if (initialUsername == null || initialUsername.trim().isEmpty() ||
            initialPassword == null || initialPassword.trim().isEmpty()) {
            log.info("Initial admin credentials not configured; skipping automatic admin creation.");
            return;
        }

        String username = initialUsername.trim();

        Optional<Admin> existingAdmin = adminRepository.findByUsername(username);
        if (existingAdmin.isPresent()) {
            log.info("Admin user '{}' already exists. Skipping initialization.", username);
            return;
        }

        Admin admin = new Admin();
        admin.setUsername(username);
        admin.setPasswordHash(passwordEncoder.encode(initialPassword.trim()));
        admin.setRole(AdminRole.ADMIN);
        adminRepository.save(admin);

        log.info("Initial admin user '{}' successfully created.", username);
    }
}
