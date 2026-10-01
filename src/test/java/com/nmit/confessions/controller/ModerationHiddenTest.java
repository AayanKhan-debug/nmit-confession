package com.nmit.confessions.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nmit.confessions.dto.RejectConfessionRequest;
import com.nmit.confessions.entity.Confession;
import com.nmit.confessions.enums.ConfessionCategory;
import com.nmit.confessions.enums.ConfessionStatus;
import com.nmit.confessions.repository.ConfessionRepository;
import com.nmit.confessions.repository.AdminRepository;
import com.nmit.confessions.repository.AuditLogRepository;
import com.nmit.confessions.entity.Admin;
import com.nmit.confessions.enums.AdminRole;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@org.springframework.transaction.annotation.Transactional
class ModerationHiddenTest {

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

    private Confession hiddenConfession;

    @BeforeEach
    void setUp() {
        auditLogRepository.deleteAll();
        confessionRepository.deleteAll();
        adminRepository.deleteAll();

        Admin admin = new Admin();
        admin.setUsername("admin1");
        admin.setPasswordHash("hash");
        admin.setRole(AdminRole.ADMIN);
        adminRepository.save(admin);

        hiddenConfession = new Confession();
        hiddenConfession.setContent("Hidden");
        hiddenConfession.setCategory(ConfessionCategory.OTHER);
        hiddenConfession.setStatus(ConfessionStatus.HIDDEN);
        confessionRepository.save(hiddenConfession);
    }

    @Test
    @WithMockUser(username = "admin1", roles = "ADMIN")
    void testGetHiddenQueue() throws Exception {
        mockMvc.perform(get("/api/admin/moderation/hidden"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].content").value("Hidden"));
    }

    @Test
    @WithMockUser(username = "admin1", roles = "ADMIN")
    void testRestoreHiddenConfession() throws Exception {
        mockMvc.perform(post("/api/admin/moderation/confessions/" + hiddenConfession.getId() + "/restore")
                .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PUBLISHED"));

        Confession updated = confessionRepository.findById(hiddenConfession.getId()).get();
        assertThat(updated.getStatus()).isEqualTo(ConfessionStatus.PUBLISHED);
        assertThat(updated.getModeratedBy().getUsername()).isEqualTo("admin1");
    }

    @Test
    @WithMockUser(username = "admin1", roles = "ADMIN")
    void testRejectHiddenConfession() throws Exception {
        RejectConfessionRequest req = new RejectConfessionRequest();
        req.setReason("Violates terms");

        mockMvc.perform(post("/api/admin/moderation/confessions/" + hiddenConfession.getId() + "/reject")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("REJECTED"));

        Confession updated = confessionRepository.findById(hiddenConfession.getId()).get();
        assertThat(updated.getStatus()).isEqualTo(ConfessionStatus.REJECTED);
        assertThat(updated.getModeratedBy().getUsername()).isEqualTo("admin1");
        assertThat(updated.getRejectionReason()).isEqualTo("Violates terms");
    }

    @Test
    @WithMockUser(username = "admin1", roles = "ADMIN")
    void testInvalidTransitions() throws Exception {
        Confession published = new Confession();
        published.setContent("Pub");
        published.setCategory(ConfessionCategory.OTHER);
        published.setStatus(ConfessionStatus.PUBLISHED);
        confessionRepository.save(published);

        mockMvc.perform(post("/api/admin/moderation/confessions/" + published.getId() + "/restore")
                .with(csrf()))
                .andExpect(status().isConflict());

        Confession pending = new Confession();
        pending.setContent("Pen");
        pending.setCategory(ConfessionCategory.OTHER);
        pending.setStatus(ConfessionStatus.PENDING);
        confessionRepository.save(pending);

        mockMvc.perform(post("/api/admin/moderation/confessions/" + pending.getId() + "/restore")
                .with(csrf()))
                .andExpect(status().isConflict());
    }
}
