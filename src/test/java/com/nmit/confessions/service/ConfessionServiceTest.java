package com.nmit.confessions.service;

import com.nmit.confessions.dto.CreateConfessionRequest;
import com.nmit.confessions.entity.Confession;
import com.nmit.confessions.enums.ConfessionCategory;
import com.nmit.confessions.enums.ConfessionStatus;
import com.nmit.confessions.exception.DuplicateConfessionException;
import com.nmit.confessions.repository.ConfessionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

class ConfessionServiceTest {

    private ConfessionRepository confessionRepository;
    private DuplicateDetectionService duplicateDetectionService;
    private ContentScreeningService contentScreeningService;
    private ConfessionService confessionService;

    @BeforeEach
    void setUp() {
        confessionRepository = mock(ConfessionRepository.class);
        duplicateDetectionService = mock(DuplicateDetectionService.class);
        contentScreeningService = mock(ContentScreeningService.class);
        confessionService = new ConfessionService(confessionRepository, duplicateDetectionService, contentScreeningService);
    }

    @Test
    void testSubmitConfessionSuccess() {
        CreateConfessionRequest request = new CreateConfessionRequest();
        request.setTitle("  My Title  ");
        request.setContent("  Some confession content  ");
        request.setCategory(ConfessionCategory.CAMPUS_LIFE);

        when(duplicateDetectionService.isDuplicate(anyString())).thenReturn(false);

        confessionService.submitConfession(request);

        verify(contentScreeningService).screenContent("Some confession content");

        ArgumentCaptor<Confession> captor = ArgumentCaptor.forClass(Confession.class);
        verify(confessionRepository).save(captor.capture());

        Confession saved = captor.getValue();
        assertThat(saved.getTitle()).isEqualTo("My Title");
        assertThat(saved.getContent()).isEqualTo("Some confession content");
        assertThat(saved.getCategory()).isEqualTo(ConfessionCategory.CAMPUS_LIFE);
        assertThat(saved.getStatus()).isEqualTo(ConfessionStatus.PENDING);
    }

    @Test
    void testSubmitDuplicateConfession() {
        CreateConfessionRequest request = new CreateConfessionRequest();
        request.setContent("duplicate content");
        request.setCategory(ConfessionCategory.RANT);

        when(duplicateDetectionService.isDuplicate(anyString())).thenReturn(true);

        assertThatThrownBy(() -> confessionService.submitConfession(request))
                .isInstanceOf(DuplicateConfessionException.class)
                .hasMessageContaining("similar confession");

        verify(confessionRepository, never()).save(any());
    }
}
