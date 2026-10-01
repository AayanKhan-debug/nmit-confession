package com.nmit.confessions.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nmit.confessions.entity.Admin;
import com.nmit.confessions.entity.Confession;
import com.nmit.confessions.enums.AdminRole;
import com.nmit.confessions.enums.ConfessionCategory;
import com.nmit.confessions.enums.ConfessionStatus;
import com.nmit.confessions.enums.ScreeningFlag;
import com.nmit.confessions.repository.AdminRepository;
import com.nmit.confessions.repository.ConfessionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Set;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class ModerationQueueTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ConfessionRepository confessionRepository;

    @Autowired
    private AdminRepository adminRepository;

    @BeforeEach
    void setUp() {
        confessionRepository.deleteAll();
        adminRepository.deleteAll();
    }

    @Test
    void testUnauthenticatedAccess() throws Exception {
        mockMvc.perform(get("/api/admin/moderation/confessions"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "STUDENT")
    void testInsufficientRoleAccess() throws Exception {
        mockMvc.perform(get("/api/admin/moderation/confessions"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "MODERATOR")
    void testQueueRetrievalAndPriority() throws Exception {
        // Normal confession
        Confession normal = new Confession();
        normal.setTitle("Normal");
        normal.setContent("Normal content");
        normal.setCategory(ConfessionCategory.CAMPUS_LIFE);
        normal.setStatus(ConfessionStatus.PENDING);
        confessionRepository.save(normal);

        // Flagged confession
        Confession flagged = new Confession();
        flagged.setTitle("Flagged");
        flagged.setContent("Profanity content");
        flagged.setCategory(ConfessionCategory.RANT);
        flagged.setStatus(ConfessionStatus.PENDING);
        flagged.setScreeningFlags(Set.of(ScreeningFlag.PROFANITY));
        confessionRepository.save(flagged);

        mockMvc.perform(get("/api/admin/moderation/confessions")
                .param("page", "0")
                .param("size", "20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(2)))
                // The flagged one should be first
                .andExpect(jsonPath("$.content[0].title").value("Flagged"))
                .andExpect(jsonPath("$.content[0].screeningFlags[0]").value("PROFANITY"))
                // The normal one should be second
                .andExpect(jsonPath("$.content[1].title").value("Normal"))
                .andExpect(jsonPath("$.content[1].screeningFlags").isEmpty());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testPaginationAndSizeEnforcement() throws Exception {
        // Create 60 confessions
        for (int i = 0; i < 60; i++) {
            Confession c = new Confession();
            c.setContent("Content " + i);
            c.setCategory(ConfessionCategory.OTHER);
            c.setStatus(ConfessionStatus.PENDING);
            confessionRepository.save(c);
        }

        // Requesting size 60, should be bounded to 50
        mockMvc.perform(get("/api/admin/moderation/confessions")
                .param("page", "0")
                .param("size", "60"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(50)));
    }
}
