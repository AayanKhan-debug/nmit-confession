package com.nmit.confessions.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nmit.confessions.dto.CreateReportRequest;
import com.nmit.confessions.entity.Confession;
import com.nmit.confessions.enums.ConfessionCategory;
import com.nmit.confessions.enums.ConfessionStatus;
import com.nmit.confessions.enums.ReportReason;
import com.nmit.confessions.repository.ConfessionRepository;
import com.nmit.confessions.repository.ReportRepository;
import com.nmit.confessions.repository.ReactionRepository;
import com.nmit.confessions.repository.AuditLogRepository;
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
class ReportActionTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ConfessionRepository confessionRepository;

    @Autowired
    private ReportRepository reportRepository;

    @Autowired
    private ReactionRepository reactionRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private Confession publishedConfession;
    private Confession pendingConfession;

    @BeforeEach
    void setUp() {
        reportRepository.deleteAll();
        reactionRepository.deleteAll();
        auditLogRepository.deleteAll();
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
    void testReportOnPublishedSucceeds() throws Exception {
        CreateReportRequest req = new CreateReportRequest();
        req.setReason(ReportReason.HARASSMENT);

        mockMvc.perform(post("/api/confessions/" + publishedConfession.getId() + "/reports")
                .cookie(new Cookie("DEVICE_TOKEN", "rep-token-1"))
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk());

        Confession updated = confessionRepository.findById(publishedConfession.getId()).get();
        assertThat(updated.getReportCount()).isEqualTo(1);
    }

    @Test
    void testReportOnPendingFails() throws Exception {
        CreateReportRequest req = new CreateReportRequest();
        req.setReason(ReportReason.HARASSMENT);

        mockMvc.perform(post("/api/confessions/" + pendingConfession.getId() + "/reports")
                .cookie(new Cookie("DEVICE_TOKEN", "rep-token-2"))
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isNotFound());
    }

    @Test
    void testDuplicateReportFails() throws Exception {
        CreateReportRequest req = new CreateReportRequest();
        req.setReason(ReportReason.HARASSMENT);

        mockMvc.perform(post("/api/confessions/" + publishedConfession.getId() + "/reports")
                .cookie(new Cookie("DEVICE_TOKEN", "dup-token-1"))
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/confessions/" + publishedConfession.getId() + "/reports")
                .cookie(new Cookie("DEVICE_TOKEN", "dup-token-1"))
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isConflict());

        Confession updated = confessionRepository.findById(publishedConfession.getId()).get();
        assertThat(updated.getReportCount()).isEqualTo(1);
    }

    @Test
    void testThresholdHidesConfession() throws Exception {
        CreateReportRequest req = new CreateReportRequest();
        req.setReason(ReportReason.SPAM);
        String json = objectMapper.writeValueAsString(req);

        // App config has hide-threshold=5
        for (int i = 0; i < 5; i++) {
            mockMvc.perform(post("/api/confessions/" + publishedConfession.getId() + "/reports")
                    .cookie(new Cookie("DEVICE_TOKEN", "thresh-token-" + i))
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(json))
                    .andExpect(status().isOk());
        }

        Confession updated = confessionRepository.findById(publishedConfession.getId()).get();
        assertThat(updated.getReportCount()).isEqualTo(5);
        assertThat(updated.getStatus()).isEqualTo(ConfessionStatus.HIDDEN);
    }

    @Test
    void testConcurrentReportsSameDevice() throws Exception {
        int threadCount = 20;
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        CountDownLatch latch = new CountDownLatch(1);
        CountDownLatch done = new CountDownLatch(threadCount);

        CreateReportRequest req = new CreateReportRequest();
        req.setReason(ReportReason.OTHER);
        String json = objectMapper.writeValueAsString(req);

        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger conflictCount = new AtomicInteger(0);

        for (int i = 0; i < threadCount; i++) {
            executor.submit(() -> {
                try {
                    latch.await();
                    mockMvc.perform(post("/api/confessions/" + publishedConfession.getId() + "/reports")
                            .cookie(new Cookie("DEVICE_TOKEN", "concurrent-same-device"))
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json))
                            .andDo(result -> {
                                if (result.getResponse().getStatus() == 200) {
                                    } else {
                                        System.out.println("Concurrent error: " + result.getResponse().getContentAsString() + " " + result.getResponse().getStatus());
                                    }
                                    if (result.getResponse().getStatus() == 200) {
                                    successCount.incrementAndGet();
                                } else if (result.getResponse().getStatus() == 409) {
                                    conflictCount.incrementAndGet();
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
        assertThat(conflictCount.get()).isGreaterThanOrEqualTo(1); // the rest
        Confession updated = confessionRepository.findById(publishedConfession.getId()).get();
        assertThat(updated.getReportCount()).isEqualTo(1);
    }

    @Test
    void testConcurrentReportsDifferentDevices() throws Exception {
        int threadCount = 5; // equals threshold
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        CountDownLatch latch = new CountDownLatch(1);
        CountDownLatch done = new CountDownLatch(threadCount);

        CreateReportRequest req = new CreateReportRequest();
        req.setReason(ReportReason.OTHER);
        String json = objectMapper.writeValueAsString(req);

        AtomicInteger successCount = new AtomicInteger(0);

        for (int i = 0; i < threadCount; i++) {
            final String deviceId = "concurrent-diff-device-" + i;
            executor.submit(() -> {
                try {
                    latch.await();
                    mockMvc.perform(post("/api/confessions/" + publishedConfession.getId() + "/reports")
                            .cookie(new Cookie("DEVICE_TOKEN", deviceId))
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json))
                            .andDo(result -> {
                                if (result.getResponse().getStatus() == 200) {
                                    } else {
                                        System.out.println("Concurrent error: " + result.getResponse().getContentAsString() + " " + result.getResponse().getStatus());
                                    }
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

        assertThat(successCount.get()).isEqualTo(5);
        Confession updated = confessionRepository.findById(publishedConfession.getId()).get();
        assertThat(updated.getReportCount()).isEqualTo(5);
        assertThat(updated.getStatus()).isEqualTo(ConfessionStatus.HIDDEN);
    }
}
