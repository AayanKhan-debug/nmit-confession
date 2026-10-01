package com.nmit.confessions.service;

import com.nmit.confessions.entity.Admin;
import com.nmit.confessions.entity.Confession;
import com.nmit.confessions.enums.AdminRole;
import com.nmit.confessions.enums.ConfessionCategory;
import com.nmit.confessions.enums.ConfessionStatus;
import com.nmit.confessions.repository.AdminRepository;
import com.nmit.confessions.repository.AuditLogRepository;
import com.nmit.confessions.repository.ConfessionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.SpyBean;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;

@SpringBootTest
class TransactionTest {

    @Autowired
    private ModerationService moderationService;

    @Autowired
    private ConfessionRepository confessionRepository;

    @Autowired
    private AdminRepository adminRepository;

    @SpyBean
    private AuditLogRepository auditLogRepository;

    private Admin moderator;
    private Confession pendingConfession;

    @BeforeEach
    void setUp() {
        confessionRepository.deleteAll();
        adminRepository.deleteAll();

        moderator = new Admin();
        moderator.setUsername("mod1");
        moderator.setPasswordHash("hash");
        moderator.setRole(AdminRole.MODERATOR);
        adminRepository.save(moderator);

        pendingConfession = new Confession();
        pendingConfession.setContent("Test transaction content");
        pendingConfession.setCategory(ConfessionCategory.OTHER);
        pendingConfession.setStatus(ConfessionStatus.PENDING);
        confessionRepository.save(pendingConfession);
    }

    @Test
    void testTransactionRollbackOnAuditFailure() {
        // Force the audit log save to throw an exception
        Mockito.doThrow(new RuntimeException("Audit failure forced")).when(auditLogRepository).save(any());

        assertThrows(RuntimeException.class, () -> {
            moderationService.approveConfession(pendingConfession.getId(), "mod1");
        });

        // Verify the confession status was rolled back and is still PENDING
        Confession saved = confessionRepository.findById(pendingConfession.getId()).get();
        assertThat(saved.getStatus()).isEqualTo(ConfessionStatus.PENDING);
        assertThat(saved.getModeratedBy()).isNull();
    }
}
