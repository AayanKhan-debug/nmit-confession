package com.nmit.confessions.config;

import com.nmit.confessions.entity.Admin;
import com.nmit.confessions.enums.AdminRole;
import com.nmit.confessions.repository.AdminRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DatabaseSeeder {

    @Bean
    @Profile("!prod")
    public CommandLineRunner initDatabase(AdminRepository adminRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (adminRepository.count() == 0) {
                Admin admin = new Admin();
                admin.setUsername("admin");
                admin.setPasswordHash(passwordEncoder.encode("password"));
                admin.setRole(AdminRole.ADMIN);
                adminRepository.save(admin);
            }
        };
    }
}
