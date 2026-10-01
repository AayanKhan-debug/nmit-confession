package com.nmit.confessions.controller;

import com.nmit.confessions.entity.Confession;
import com.nmit.confessions.enums.ConfessionCategory;
import com.nmit.confessions.enums.ConfessionStatus;
import com.nmit.confessions.repository.ConfessionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class PublicConfessionFeedTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ConfessionRepository confessionRepository;

    @BeforeEach
    void setUp() {
        confessionRepository.deleteAll();

        // Pending
        Confession pending = new Confession();
        pending.setContent("Pending");
        pending.setCategory(ConfessionCategory.CAMPUS_LIFE);
        pending.setStatus(ConfessionStatus.PENDING);
        confessionRepository.save(pending);

        // Published 1
        Confession pub1 = new Confession();
        pub1.setContent("Published 1");
        pub1.setCategory(ConfessionCategory.RANT);
        pub1.setStatus(ConfessionStatus.PUBLISHED);
        confessionRepository.save(pub1);

        // Published 2
        Confession pub2 = new Confession();
        pub2.setContent("Published 2");
        pub2.setCategory(ConfessionCategory.CAMPUS_LIFE);
        pub2.setStatus(ConfessionStatus.PUBLISHED);
        confessionRepository.save(pub2);

        // Rejected
        Confession rejected = new Confession();
        rejected.setContent("Rejected");
        rejected.setCategory(ConfessionCategory.OTHER);
        rejected.setStatus(ConfessionStatus.REJECTED);
        confessionRepository.save(rejected);
    }

    @Test
    void testPublicFeedReturnsOnlyPublished() throws Exception {
        mockMvc.perform(get("/api/confessions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(2)))
                .andExpect(jsonPath("$.content[0].content").exists())
                .andExpect(jsonPath("$.content[0].screeningFlags").doesNotExist());
    }

    @Test
    void testPublicFeedCategoryFilter() throws Exception {
        mockMvc.perform(get("/api/confessions").param("category", "CAMPUS_LIFE"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].content").value("Published 2"));
    }

    @Test
    void testPublicFeedInvalidCategory() throws Exception {
        mockMvc.perform(get("/api/confessions").param("category", "INVALID_CAT"))
                .andExpect(status().isBadRequest());
    }
}
