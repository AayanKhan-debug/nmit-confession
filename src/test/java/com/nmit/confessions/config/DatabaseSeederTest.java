package com.nmit.confessions.config;

import com.nmit.confessions.entity.Admin;
import com.nmit.confessions.enums.AdminRole;
import com.nmit.confessions.repository.AdminRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DatabaseSeederTest {

    @Mock
    private AdminRepository adminRepository;

    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        passwordEncoder = new BCryptPasswordEncoder();
    }

    @Test
    @DisplayName("Creates initial admin when none exists with configured username")
    void testInitialAdminCreation() {
        when(adminRepository.findByUsername("admin")).thenReturn(Optional.empty());

        DatabaseSeeder seeder = new DatabaseSeeder(adminRepository, passwordEncoder, "admin", "adminPass123");
        seeder.run();

        ArgumentCaptor<Admin> adminCaptor = ArgumentCaptor.forClass(Admin.class);
        verify(adminRepository, times(1)).save(adminCaptor.capture());

        Admin saved = adminCaptor.getValue();
        assertThat(saved.getUsername()).isEqualTo("admin");
        assertThat(saved.getRole()).isEqualTo(AdminRole.ADMIN);
        assertThat(saved.getPasswordHash()).isNotBlank();
    }

    @Test
    @DisplayName("Hashes initial password using BCrypt and never stores plaintext")
    void testBCryptPasswordHashing() {
        String rawPassword = "superSecretPassword!";
        when(adminRepository.findByUsername("admin")).thenReturn(Optional.empty());

        DatabaseSeeder seeder = new DatabaseSeeder(adminRepository, passwordEncoder, "admin", rawPassword);
        seeder.run();

        ArgumentCaptor<Admin> adminCaptor = ArgumentCaptor.forClass(Admin.class);
        verify(adminRepository).save(adminCaptor.capture());

        Admin saved = adminCaptor.getValue();
        assertThat(saved.getPasswordHash()).isNotEqualTo(rawPassword);
        assertThat(saved.getPasswordHash()).startsWith("$2a$");
        assertThat(passwordEncoder.matches(rawPassword, saved.getPasswordHash())).isTrue();
    }

    @Test
    @DisplayName("Does not duplicate admin if one already exists")
    void testExistingAdminIsNotDuplicated() {
        Admin existingAdmin = new Admin();
        existingAdmin.setUsername("admin");
        existingAdmin.setPasswordHash(passwordEncoder.encode("existingPass"));
        existingAdmin.setRole(AdminRole.ADMIN);

        when(adminRepository.findByUsername("admin")).thenReturn(Optional.of(existingAdmin));

        DatabaseSeeder seeder = new DatabaseSeeder(adminRepository, passwordEncoder, "admin", "someNewPassword");
        seeder.run();

        verify(adminRepository, never()).save(any(Admin.class));
    }

    @Test
    @DisplayName("Does not overwrite existing admin password on restart")
    void testExistingAdminPasswordIsNotOverwritten() {
        String originalPassword = "originalStaffPassword123";
        String originalHash = passwordEncoder.encode(originalPassword);

        Admin existingAdmin = new Admin();
        existingAdmin.setUsername("staff_moderator");
        existingAdmin.setPasswordHash(originalHash);
        existingAdmin.setRole(AdminRole.ADMIN);

        when(adminRepository.findByUsername("staff_moderator")).thenReturn(Optional.of(existingAdmin));

        // Attempting to seed with a different password
        DatabaseSeeder seeder = new DatabaseSeeder(adminRepository, passwordEncoder, "staff_moderator", "differentPassword999");
        seeder.run();

        // Existing admin password hash must remain completely unchanged
        assertThat(existingAdmin.getPasswordHash()).isEqualTo(originalHash);
        assertThat(passwordEncoder.matches(originalPassword, existingAdmin.getPasswordHash())).isTrue();
        assertThat(passwordEncoder.matches("differentPassword999", existingAdmin.getPasswordHash())).isFalse();
        verify(adminRepository, never()).save(any(Admin.class));
    }

    @Test
    @DisplayName("Respects custom configured username from environment variable")
    void testConfiguredUsernameIsRespected() {
        String customUsername = "custom_production_admin";
        when(adminRepository.findByUsername(customUsername)).thenReturn(Optional.empty());

        DatabaseSeeder seeder = new DatabaseSeeder(adminRepository, passwordEncoder, customUsername, "prodPass456");
        seeder.run();

        ArgumentCaptor<Admin> adminCaptor = ArgumentCaptor.forClass(Admin.class);
        verify(adminRepository).save(adminCaptor.capture());

        Admin saved = adminCaptor.getValue();
        assertThat(saved.getUsername()).isEqualTo(customUsername);
        assertThat(passwordEncoder.matches("prodPass456", saved.getPasswordHash())).isTrue();
    }

    @Test
    @DisplayName("Skips admin creation if credentials are empty or blank")
    void testMissingOrBlankCredentialsSkipsCreation() {
        DatabaseSeeder emptyUsername = new DatabaseSeeder(adminRepository, passwordEncoder, "", "pass");
        emptyUsername.run();

        DatabaseSeeder nullUsername = new DatabaseSeeder(adminRepository, passwordEncoder, null, "pass");
        nullUsername.run();

        DatabaseSeeder emptyPassword = new DatabaseSeeder(adminRepository, passwordEncoder, "admin", "   ");
        emptyPassword.run();

        DatabaseSeeder nullPassword = new DatabaseSeeder(adminRepository, passwordEncoder, "admin", null);
        nullPassword.run();

        verify(adminRepository, never()).save(any(Admin.class));
        verify(adminRepository, never()).findByUsername(anyString());
    }
}
