package com.nmit.confessions.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nmit.confessions.dto.ReactionRequest;
import com.nmit.confessions.entity.Confession;
import com.nmit.confessions.enums.ConfessionCategory;
import com.nmit.confessions.enums.ConfessionStatus;
import com.nmit.confessions.enums.ReactionType;
import com.nmit.confessions.repository.ConfessionRepository;
import com.nmit.confessions.repository.ReactionRepository;
import com.nmit.confessions.service.DeviceTokenService;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ReactionActionTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ConfessionRepository confessionRepository;

    @Autowired
    private ReactionRepository reactionRepository;

    @Autowired
    private ObjectMapper objectMapper;
    
    @Autowired
    private DeviceTokenService deviceTokenService;

    private Confession publishedConfession;
    private Confession pendingConfession;

    @BeforeEach
    void setUp() {
        reactionRepository.deleteAll();
        confessionRepository.deleteAll();

        publishedConfession = new Confession();
        publishedConfession.setContent("Pub");
        publishedConfession.setCategory(ConfessionCategory.OTHER);
        publishedConfession.setStatus(ConfessionStatus.PUBLISHED);
        confessionRepository.save(publishedConfession);

        pendingConfession = new Confession();
        pendingConfession.setContent("Pen");
        pendingConfession.setCategory(ConfessionCategory.OTHER);
        pendingConfession.setStatus(ConfessionStatus.PENDING);
        confessionRepository.save(pendingConfession);
    }

    @Test
    void testReactionOnPublishedSucceeds() throws Exception {
        ReactionRequest req = new ReactionRequest();
        req.setType(ReactionType.LOVE);

        mockMvc.perform(post("/api/confessions/" + publishedConfession.getId() + "/reactions")
                .cookie(new Cookie("DEVICE_TOKEN", "test-token-1"))
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk());

        Confession updated = confessionRepository.findById(publishedConfession.getId()).get();
        assertThat(updated.getReactionLoveCount()).isEqualTo(1);
    }

    @Test
    void testReactionOnPendingFails() throws Exception {
        ReactionRequest req = new ReactionRequest();
        req.setType(ReactionType.LOVE);

        mockMvc.perform(post("/api/confessions/" + pendingConfession.getId() + "/reactions")
                .cookie(new Cookie("DEVICE_TOKEN", "test-token-1"))
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isNotFound());
    }

    @Test
    void testDuplicateReactionFails() throws Exception {
        ReactionRequest req = new ReactionRequest();
        req.setType(ReactionType.FIRE);

        mockMvc.perform(post("/api/confessions/" + publishedConfession.getId() + "/reactions")
                .cookie(new Cookie("DEVICE_TOKEN", "test-token-same"))
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/confessions/" + publishedConfession.getId() + "/reactions")
                .cookie(new Cookie("DEVICE_TOKEN", "test-token-same"))
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isConflict());

        Confession updated = confessionRepository.findById(publishedConfession.getId()).get();
        assertThat(updated.getReactionFireCount()).isEqualTo(1); // Still 1
    }

    @Test
    void testConcurrentReactionsSameDevice() throws Exception {
        int threadCount = 20;
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        CountDownLatch latch = new CountDownLatch(1);
        CountDownLatch done = new CountDownLatch(threadCount);
        
        ReactionRequest req = new ReactionRequest();
        req.setType(ReactionType.SAD);
        String json = objectMapper.writeValueAsString(req);

        AtomicInteger successCount = new AtomicInteger(0);

        for (int i = 0; i < threadCount; i++) {
            executor.submit(() -> {
                try {
                    latch.await();
                    mockMvc.perform(post("/api/confessions/" + publishedConfession.getId() + "/reactions")
                            .cookie(new Cookie("DEVICE_TOKEN", "concurrent-device-1"))
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json))
                            .andDo(result -> {
                                if (result.getResponse().getStatus() == 200) {
                                    successCount.incrementAndGet();
                                }
                            });
                } catch (Exception e) {
                    e.printStackTrace();
                } finally {
                    done.countDown();
                }
            });
        }
        
        latch.countDown();
        done.await();
        executor.shutdown();

        assertThat(successCount.get()).isEqualTo(1);
        Confession updated = confessionRepository.findById(publishedConfession.getId()).get();
        assertThat(updated.getReactionSadCount()).isEqualTo(1);
    }

    @Test
    void testConcurrentReactionsDifferentDevices() throws Exception {
        int threadCount = 20;
        java.util.concurrent.ExecutorService executor = java.util.concurrent.Executors.newFixedThreadPool(threadCount);
        java.util.concurrent.CountDownLatch latch = new java.util.concurrent.CountDownLatch(1);
        java.util.concurrent.CountDownLatch done = new java.util.concurrent.CountDownLatch(threadCount);
        
        com.nmit.confessions.dto.ReactionRequest req = new com.nmit.confessions.dto.ReactionRequest();
        req.setType(com.nmit.confessions.enums.ReactionType.FUNNY);
        String json = objectMapper.writeValueAsString(req);

        java.util.concurrent.atomic.AtomicInteger successCount = new java.util.concurrent.atomic.AtomicInteger(0);

        for (int i = 0; i < threadCount; i++) {
            final String deviceId = "diff-device-" + i;
            executor.submit(() -> {
                try {
                    latch.await();
                    mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post("/api/confessions/" + publishedConfession.getId() + "/reactions")
                            .cookie(new jakarta.servlet.http.Cookie("DEVICE_TOKEN", deviceId))
                            .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf())
                            .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                            .content(json))
                            .andDo(result -> {
                                if (result.getResponse().getStatus() == 200) {
                                    successCount.incrementAndGet();
                                }
                            });
                } catch (Exception e) {
                    e.printStackTrace();
                } finally {
                    done.countDown();
                }
            });
        }
        
        latch.countDown();
        done.await();
        executor.shutdown();

        org.assertj.core.api.Assertions.assertThat(successCount.get()).isEqualTo(20);
        com.nmit.confessions.entity.Confession updated = confessionRepository.findById(publishedConfession.getId()).get();
        org.assertj.core.api.Assertions.assertThat(updated.getReactionFunnyCount()).isEqualTo(20);
    }
}

