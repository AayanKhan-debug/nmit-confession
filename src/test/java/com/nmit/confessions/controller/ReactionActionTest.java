package com.nmit.confessions.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nmit.confessions.config.ReactionDataMigration;
import com.nmit.confessions.dto.ReactionRequest;
import com.nmit.confessions.entity.Confession;
import com.nmit.confessions.entity.Reaction;
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

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
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

    @Autowired
    private ReactionDataMigration reactionDataMigration;

    @Autowired
    private DataSource dataSource;

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
    void testDuplicateReactionSameTypeFails() throws Exception {
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
    void testDuplicateReactionDifferentTypeFails() throws Exception {
        // Device reacts with LOVE first -> 200 OK
        ReactionRequest reqLove = new ReactionRequest();
        reqLove.setType(ReactionType.LOVE);

        mockMvc.perform(post("/api/confessions/" + publishedConfession.getId() + "/reactions")
                .cookie(new Cookie("DEVICE_TOKEN", "device-multi-type-test"))
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(reqLove)))
                .andExpect(status().isOk());

        // Same device tries FUNNY on same confession -> 409 Conflict
        ReactionRequest reqFunny = new ReactionRequest();
        reqFunny.setType(ReactionType.FUNNY);

        mockMvc.perform(post("/api/confessions/" + publishedConfession.getId() + "/reactions")
                .cookie(new Cookie("DEVICE_TOKEN", "device-multi-type-test"))
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(reqFunny)))
                .andExpect(status().isConflict());

        // Same device tries SAD -> 409 Conflict
        ReactionRequest reqSad = new ReactionRequest();
        reqSad.setType(ReactionType.SAD);

        mockMvc.perform(post("/api/confessions/" + publishedConfession.getId() + "/reactions")
                .cookie(new Cookie("DEVICE_TOKEN", "device-multi-type-test"))
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(reqSad)))
                .andExpect(status().isConflict());

        // Same device tries FIRE -> 409 Conflict
        ReactionRequest reqFire = new ReactionRequest();
        reqFire.setType(ReactionType.FIRE);

        mockMvc.perform(post("/api/confessions/" + publishedConfession.getId() + "/reactions")
                .cookie(new Cookie("DEVICE_TOKEN", "device-multi-type-test"))
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(reqFire)))
                .andExpect(status().isConflict());

        // Assert counts: LOVE is 1, all others 0
        Confession updated = confessionRepository.findById(publishedConfession.getId()).get();
        assertThat(updated.getReactionLoveCount()).isEqualTo(1);
        assertThat(updated.getReactionFunnyCount()).isEqualTo(0);
        assertThat(updated.getReactionSadCount()).isEqualTo(0);
        assertThat(updated.getReactionFireCount()).isEqualTo(0);

        // Assert exactly 1 reaction row in database
        List<Reaction> reactions = reactionRepository.findAll();
        assertThat(reactions).hasSize(1);
        assertThat(reactions.get(0).getReactionType()).isEqualTo(ReactionType.LOVE);
    }

    @Test
    void testSameDeviceCanReactToDifferentConfessions() throws Exception {
        Confession confessionB = new Confession();
        confessionB.setContent("Confession B");
        confessionB.setCategory(ConfessionCategory.CAMPUS_LIFE);
        confessionB.setStatus(ConfessionStatus.PUBLISHED);
        confessionRepository.save(confessionB);

        // React to Confession A
        ReactionRequest reqA = new ReactionRequest();
        reqA.setType(ReactionType.LOVE);
        mockMvc.perform(post("/api/confessions/" + publishedConfession.getId() + "/reactions")
                .cookie(new Cookie("DEVICE_TOKEN", "device-cross-confession"))
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(reqA)))
                .andExpect(status().isOk());

        // React to Confession B with a different reaction type
        ReactionRequest reqB = new ReactionRequest();
        reqB.setType(ReactionType.FIRE);
        mockMvc.perform(post("/api/confessions/" + confessionB.getId() + "/reactions")
                .cookie(new Cookie("DEVICE_TOKEN", "device-cross-confession"))
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(reqB)))
                .andExpect(status().isOk());

        Confession updatedA = confessionRepository.findById(publishedConfession.getId()).get();
        Confession updatedB = confessionRepository.findById(confessionB.getId()).get();

        assertThat(updatedA.getReactionLoveCount()).isEqualTo(1);
        assertThat(updatedB.getReactionFireCount()).isEqualTo(1);
    }

    @Test
    void testRawDeviceTokenIsNeverStoredInDatabase() throws Exception {
        String rawToken = "super-secret-raw-device-uuid-999";
        ReactionRequest req = new ReactionRequest();
        req.setType(ReactionType.LOVE);

        mockMvc.perform(post("/api/confessions/" + publishedConfession.getId() + "/reactions")
                .cookie(new Cookie("DEVICE_TOKEN", rawToken))
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk());

        List<Reaction> reactions = reactionRepository.findAll();
        assertThat(reactions).hasSize(1);
        Reaction saved = reactions.get(0);

        // Must NOT store raw token
        assertThat(saved.getVoterTokenHash()).isNotEqualTo(rawToken);
        // Must store cryptographic SHA-256 hash
        assertThat(saved.getVoterTokenHash()).isEqualTo(deviceTokenService.hashToken(rawToken));
        assertThat(saved.getVoterTokenHash()).isNotEmpty();
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
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        CountDownLatch latch = new CountDownLatch(1);
        CountDownLatch done = new CountDownLatch(threadCount);
        
        ReactionRequest req = new ReactionRequest();
        req.setType(ReactionType.FUNNY);
        String json = objectMapper.writeValueAsString(req);

        AtomicInteger successCount = new AtomicInteger(0);

        for (int i = 0; i < threadCount; i++) {
            final String deviceId = "diff-device-" + i;
            executor.submit(() -> {
                try {
                    latch.await();
                    mockMvc.perform(post("/api/confessions/" + publishedConfession.getId() + "/reactions")
                            .cookie(new Cookie("DEVICE_TOKEN", deviceId))
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

        assertThat(successCount.get()).isEqualTo(20);
        Confession updated = confessionRepository.findById(publishedConfession.getId()).get();
        assertThat(updated.getReactionFunnyCount()).isEqualTo(20);
    }

    @Test
    void testReactionDataMigrationDeduplication() throws Exception {
        // Set up confession with counters representing 2 LOVE and 1 FIRE
        publishedConfession.setReactionLoveCount(2);
        publishedConfession.setReactionFireCount(1);
        confessionRepository.save(publishedConfession);

        String voterHash = deviceTokenService.hashToken("duplicate-voter-device");

        // Insert 3 duplicate reactions directly bypassing unique constraint (simulating pre-existing prod data)
        try (Connection conn = dataSource.getConnection()) {
            // Drop unique constraint/index temporarily to insert duplicates if present
            try (PreparedStatement ps = conn.prepareStatement("ALTER TABLE reactions DROP CONSTRAINT IF EXISTS uk_reactions_confession_voter")) {
                ps.execute();
            } catch (Exception ignored) {}
            try (PreparedStatement ps = conn.prepareStatement("DROP INDEX IF EXISTS uk_reactions_confession_voter")) {
                ps.execute();
            } catch (Exception ignored) {}

            String insertSql = "INSERT INTO reactions (confession_id, voter_token_hash, reaction_type, created_at) VALUES (?, ?, ?, ?)";
            try (PreparedStatement ps = conn.prepareStatement(insertSql)) {
                // Row 1: earliest LOVE
                ps.setLong(1, publishedConfession.getId());
                ps.setString(2, voterHash);
                ps.setString(3, "LOVE");
                ps.setTimestamp(4, Timestamp.from(Instant.now().minusSeconds(600)));
                ps.executeUpdate();

                // Row 2: duplicate LOVE
                ps.setLong(1, publishedConfession.getId());
                ps.setString(2, voterHash);
                ps.setString(3, "LOVE");
                ps.setTimestamp(4, Timestamp.from(Instant.now().minusSeconds(300)));
                ps.executeUpdate();

                // Row 3: duplicate FIRE
                ps.setLong(1, publishedConfession.getId());
                ps.setString(2, voterHash);
                ps.setString(3, "FIRE");
                ps.setTimestamp(4, Timestamp.from(Instant.now().minusSeconds(100)));
                ps.executeUpdate();
            }
        }

        // Run migration
        reactionDataMigration.migrate();

        // Verify: only 1 reaction remains for that device on that confession
        List<Reaction> remaining = reactionRepository.findAll();
        assertThat(remaining).hasSize(1);
        assertThat(remaining.get(0).getReactionType()).isEqualTo(ReactionType.LOVE);

        // Verify: confession counters adjusted (2 LOVE - 1 = 1, 1 FIRE - 1 = 0)
        Confession refreshed = confessionRepository.findById(publishedConfession.getId()).get();
        assertThat(refreshed.getReactionLoveCount()).isEqualTo(1);
        assertThat(refreshed.getReactionFireCount()).isEqualTo(0);
    }
}
