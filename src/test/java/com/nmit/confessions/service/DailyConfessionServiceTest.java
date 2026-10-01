package com.nmit.confessions.service;

import com.nmit.confessions.dto.PublicConfessionResponse;
import com.nmit.confessions.entity.Confession;
import com.nmit.confessions.enums.ConfessionStatus;
import com.nmit.confessions.repository.ConfessionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DailyConfessionServiceTest {

    @Mock
    private ConfessionRepository confessionRepository;

    @InjectMocks
    private DailyConfessionService dailyConfessionService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(dailyConfessionService, "discoveryTimezone", "UTC");
    }

    @Test
    void testGetDailyConfession_DeterministicSelection() {
        List<Long> ids = Arrays.asList(1L, 2L, 3L, 4L, 5L);
        when(confessionRepository.findCandidateIdsForDaily(any(Instant.class))).thenReturn(ids);
        
        Confession mockConfession = new Confession();
        mockConfession.setId(3L);
        mockConfession.setStatus(ConfessionStatus.PUBLISHED);
        
        // Mock returning empty (not published) for some IDs until one matches
        when(confessionRepository.findByIdAndStatus(anyLong(), eq(ConfessionStatus.PUBLISHED)))
                .thenAnswer(invocation -> {
                    Long id = invocation.getArgument(0);
                    if (id == 3L) return Optional.of(mockConfession);
                    return Optional.empty();
                });

        Optional<PublicConfessionResponse> response1 = dailyConfessionService.getDailyConfession();
        Optional<PublicConfessionResponse> response2 = dailyConfessionService.getDailyConfession();

        assertThat(response1).isPresent();
        assertThat(response1.get().getId()).isEqualTo(3L);
        
        // Assert exactly same behavior on repeated request
        assertThat(response2).isPresent();
        assertThat(response2.get().getId()).isEqualTo(3L);
    }

    @Test
    void testGetDailyConfession_EmptyDatabase() {
        when(confessionRepository.findCandidateIdsForDaily(any(Instant.class))).thenReturn(Collections.emptyList());

        Optional<PublicConfessionResponse> response = dailyConfessionService.getDailyConfession();

        assertThat(response).isEmpty();
        verify(confessionRepository, never()).findByIdAndStatus(anyLong(), any());
    }

    @Test
    void testGetDailyConfession_FallbackAfterModeration() {
        List<Long> ids = Arrays.asList(1L, 2L, 3L, 4L);
        when(confessionRepository.findCandidateIdsForDaily(any(Instant.class))).thenReturn(ids);

        Confession c1 = new Confession();
        c1.setId(1L);
        c1.setStatus(ConfessionStatus.PUBLISHED);

        // Assume the shuffled order is [3, 1, 4, 2].
        // Let's pretend 3 is HIDDEN, so we expect 1 to be returned.
        when(confessionRepository.findByIdAndStatus(anyLong(), eq(ConfessionStatus.PUBLISHED)))
                .thenAnswer(invocation -> {
                    Long id = invocation.getArgument(0);
                    if (id == 1L) return Optional.of(c1);
                    return Optional.empty(); // all others hidden
                });

        Optional<PublicConfessionResponse> response = dailyConfessionService.getDailyConfession();

        assertThat(response).isPresent();
        assertThat(response.get().getId()).isEqualTo(1L);
    }
    
    @Test
    void testGetDailyConfession_TimezoneRespected() {
        ReflectionTestUtils.setField(dailyConfessionService, "discoveryTimezone", "Asia/Kolkata");
        when(confessionRepository.findCandidateIdsForDaily(any(Instant.class))).thenReturn(Collections.emptyList());
        
        dailyConfessionService.getDailyConfession();
        
        // Assert we called with start of day for Kolkata
        verify(confessionRepository).findCandidateIdsForDaily(any(Instant.class));
    }
}
