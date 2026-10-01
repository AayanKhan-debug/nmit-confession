package com.nmit.confessions;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nmit.confessions.dto.CreateConfessionRequest;
import com.nmit.confessions.entity.Confession;
import com.nmit.confessions.enums.ConfessionCategory;
import com.nmit.confessions.enums.ConfessionStatus;
import com.nmit.confessions.repository.ConfessionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.cookie;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ConfessionIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ConfessionRepository confessionRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        confessionRepository.deleteAll();
    }

    @Test
    void testSuccessfulSubmissionAndDuplicateDetection() throws Exception {
        CreateConfessionRequest request = new CreateConfessionRequest();
        request.setTitle("Campus Life");
        request.setContent("This is an anonymous test confession.");
        request.setCategory(ConfessionCategory.CAMPUS_LIFE);

        // First submission - Success
        mockMvc.perform(post("/api/confessions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isAccepted())
                .andExpect(cookie().exists("DEVICE_TOKEN"));

        List<Confession> confessions = confessionRepository.findAll();
        assertThat(confessions).hasSize(1);
        Confession saved = confessions.get(0);
        assertThat(saved.getStatus()).isEqualTo(ConfessionStatus.PENDING);
        assertThat(saved.getContent()).isEqualTo("This is an anonymous test confession.");

        // Second submission - Duplicate Conflict
        mockMvc.perform(post("/api/confessions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict());
    }

    @Test
    void testValidationFailures() throws Exception {
        CreateConfessionRequest request = new CreateConfessionRequest();
        
        // Empty content
        mockMvc.perform(post("/api/confessions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
                
        // Too short
        request.setContent("short");
        mockMvc.perform(post("/api/confessions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testPrivacyConstraints() throws Exception {
        CreateConfessionRequest request = new CreateConfessionRequest();
        request.setTitle("Privacy Check");
        request.setContent("This confession must not trace back to me.");
        request.setCategory(ConfessionCategory.RANT);

        mockMvc.perform(post("/api/confessions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isAccepted());

        List<Confession> confessions = confessionRepository.findAll();
        Confession saved = confessions.get(confessions.size() - 1);
        
        // Asserting that there is no submitter IP, user ID, or device token on the entity
        // We ensure these fields literally don't exist by iterating declared fields
        boolean hasIdentityFields = false;
        for (java.lang.reflect.Field field : Confession.class.getDeclaredFields()) {
            String name = field.getName().toLowerCase();
            if (name.contains("ip") || name.contains("user") || name.contains("submitter") || name.contains("device") || name.contains("email")) {
                hasIdentityFields = true;
            }
        }
        assertThat(hasIdentityFields).isFalse();
        
        // Ensure standard fields are clean
        assertThat(saved.getModeratedBy()).isNull(); // Should be null on creation
        assertThat(saved.getStatus()).isEqualTo(ConfessionStatus.PENDING);
    }
}
