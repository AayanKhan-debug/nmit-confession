package com.nmit.confessions.service;

import com.nmit.confessions.enums.ConfessionCategory;
import com.nmit.confessions.repository.ConfessionRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.util.Collections;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SearchServiceTest {

    @Mock
    private ConfessionRepository confessionRepository;

    @InjectMocks
    private SearchService searchService;

    @Test
    void testSearchValidationMissingQuery() {
        assertThrows(IllegalArgumentException.class, () -> 
            searchService.search(null, null, 0, 20));
    }

    @Test
    void testSearchValidationBlankQuery() {
        assertThrows(IllegalArgumentException.class, () -> 
            searchService.search("   ", null, 0, 20));
    }

    @Test
    void testSearchValidationMaxLength() {
        String longQuery = "a".repeat(101);
        assertThrows(IllegalArgumentException.class, () -> 
            searchService.search(longQuery, null, 0, 20));
    }

    @Test
    void testSearchNormalization() {
        when(confessionRepository.searchPublishedConfessions(any(), any()))
                .thenReturn(new PageImpl<>(Collections.emptyList()));

        searchService.search("  college  ", null, 0, 20);

        verify(confessionRepository).searchPublishedConfessions(eq("college"), any(Pageable.class));
    }

    @Test
    void testSearchSpecialCharacters() {
        when(confessionRepository.searchPublishedConfessions(any(), any()))
                .thenReturn(new PageImpl<>(Collections.emptyList()));

        searchService.search("100% _real_ \\", null, 0, 20);

        verify(confessionRepository).searchPublishedConfessions(eq("100\\% \\_real\\_ \\\\"), any(Pageable.class));
    }

    @Test
    void testSearchCategory() {
        when(confessionRepository.searchPublishedConfessionsByCategory(any(), any(), any()))
                .thenReturn(new PageImpl<>(Collections.emptyList()));

        searchService.search("love", ConfessionCategory.CRUSH, 0, 20);

        verify(confessionRepository).searchPublishedConfessionsByCategory(
            eq("love"), eq(ConfessionCategory.CRUSH), any(Pageable.class));
    }

    @Test
    void testPaginationValidation() {
        assertThrows(IllegalArgumentException.class, () -> 
            searchService.search("test", null, -1, 20));

        assertThrows(IllegalArgumentException.class, () -> 
            searchService.search("test", null, 0, 0));

        assertThrows(IllegalArgumentException.class, () -> 
            searchService.search("test", null, 0, 100)); // > 50
    }
}
