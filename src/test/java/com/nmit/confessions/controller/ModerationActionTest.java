package com.nmit.confessions.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nmit.confessions.dto.RejectConfessionRequest;
import com.nmit.confessions.entity.Admin;
import com.nmit.confessions.entity.AuditLog;
import com.nmit.confessions.entity.Confession;
import com.nmit.confessions.enums.AdminRole;
import com.nmit.confessions.enums.AuditAction;
import com.nmit.confessions.enums.ConfessionCategory;
import com.nmit.confessions.enums.ConfessionStatus;
import com.nmit.confessions.repository.AdminRepository;
import com.nmit.confessions.repository.AuditLogRepository;
import com.nmit.confessions.repository.ConfessionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@org.springframework.transaction.annotation.Transactional
class ModerationActionTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ConfessionRepository confessionRepository;

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private Admin moderator;
    private Confession pendingConfession;

    @BeforeEach
    void setUp() {
        auditLogRepository.deleteAll();
        confessionRepository.deleteAll();
        adminRepository.deleteAll();

        moderator = new Admin();
        moderator.setUsername("mod1");
        moderator.setPasswordHash("hash");
        moderator.setRole(AdminRole.MODERATOR);
        adminRepository.save(moderator);

        pendingConfession = new Confession();
        pendingConfession.setTitle("Test");
        pendingConfession.setContent("Content");
        pendingConfession.setCategory(ConfessionCategory.OTHER);
        pendingConfession.setStatus(ConfessionStatus.PENDING);
        confessionRepository.save(pendingConfession);
    }

    @Test
    @WithMockUser(username = "mod1", roles = "MODERATOR")
    void testApproveConfession() throws Exception {
        mockMvc.perform(post("/api/admin/moderation/confessions/" + pendingConfession.getId() + "/approve").with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PUBLISHED"));

        Confession updated = confessionRepository.findById(pendingConfession.getId()).get();
        assertThat(updated.getStatus()).isEqualTo(ConfessionStatus.PUBLISHED);
        assertThat(updated.getModeratedBy().getUsername()).isEqualTo("mod1");
        assertThat(updated.getModeratedAt()).isNotNull();
        assertThat(updated.getPublishedAt()).isNotNull();

        List<AuditLog> logs = auditLogRepository.findAll();
        assertThat(logs).hasSize(1);
        assertThat(logs.get(0).getAction()).isEqualTo(AuditAction.APPROVE_CONFESSION);
        assertThat(logs.get(0).getAdmin().getUsername()).isEqualTo("mod1");
        assertThat(logs.get(0).getTargetId()).isEqualTo(pendingConfession.getId());
    }

    @Test
    @WithMockUser(username = "mod1", roles = "MODERATOR")
    void testRejectConfession() throws Exception {
        RejectConfessionRequest request = new RejectConfessionRequest();
        request.setReason("Inappropriate content");

        mockMvc.perform(post("/api/admin/moderation/confessions/" + pendingConfession.getId() + "/reject").with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("REJECTED"));

        Confession updated = confessionRepository.findById(pendingConfession.getId()).get();
        assertThat(updated.getStatus()).isEqualTo(ConfessionStatus.REJECTED);
        assertThat(updated.getModeratedBy().getUsername()).isEqualTo("mod1");
        assertThat(updated.getRejectionReason()).isEqualTo("Inappropriate content");

        List<AuditLog> logs = auditLogRepository.findAll();
        assertThat(logs).hasSize(1);
        assertThat(logs.get(0).getAction()).isEqualTo(AuditAction.REJECT_CONFESSION);
    }

    @Test
    @WithMockUser(username = "mod1", roles = "MODERATOR")
    void testInvalidTransitions() throws Exception {
        pendingConfession.setStatus(ConfessionStatus.PUBLISHED);
        confessionRepository.save(pendingConfession);

        mockMvc.perform(post("/api/admin/moderation/confessions/" + pendingConfession.getId() + "/approve").with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf()))
                .andExpect(status().isConflict());

        RejectConfessionRequest request = new RejectConfessionRequest();
        request.setReason("Testing");
        mockMvc.perform(post("/api/admin/moderation/confessions/" + pendingConfession.getId() + "/reject").with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict());
    }

    @Test
    void testUnauthenticatedAccess() throws Exception {
        mockMvc.perform(post("/api/admin/moderation/confessions/" + pendingConfession.getId() + "/approve").with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf()))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "mod1", roles = "MODERATOR")
    void testModerationApproveFailsWithoutCsrfToken() throws Exception {
        // Without CSRF token header/processor, mutating requests to moderation endpoints must return 403 Forbidden
        mockMvc.perform(post("/api/admin/moderation/confessions/" + pendingConfession.getId() + "/approve"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "mod1", roles = "MODERATOR")
    void testModerationApproveSucceedsWithCsrfTokenHeader() throws Exception {
        mockMvc.perform(post("/api/admin/moderation/confessions/" + pendingConfession.getId() + "/approve")
                .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf().asHeader()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PUBLISHED"));
    }
}
