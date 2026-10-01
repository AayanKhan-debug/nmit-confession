package com.nmit.confessions.repository;

import com.nmit.confessions.entity.Admin;
import com.nmit.confessions.enums.AdminRole;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class AdminRepositoryTest {

    @Autowired
    private AdminRepository adminRepository;

    @Test
    void shouldSaveAndFindAdminByUsername() {
        Admin admin = new Admin();
        admin.setUsername("testadmin");
        admin.setPasswordHash("hashedpassword");
        admin.setRole(AdminRole.MODERATOR);

        adminRepository.save(admin);

        Optional<Admin> found = adminRepository.findByUsername("testadmin");
        assertThat(found).isPresent();
        assertThat(found.get().getUsername()).isEqualTo("testadmin");
        assertThat(found.get().getRole()).isEqualTo(AdminRole.MODERATOR);
    }
}
