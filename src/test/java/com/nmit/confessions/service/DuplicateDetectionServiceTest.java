package com.nmit.confessions.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;

class DuplicateDetectionServiceTest {

    private DuplicateDetectionService duplicateDetectionService;

    @BeforeEach
    void setUp() {
        duplicateDetectionService = new DuplicateDetectionService();
        ReflectionTestUtils.setField(duplicateDetectionService, "windowSeconds", 3600L);
    }

    @Test
    void testIsDuplicateExactMatch() {
        String content = "This is a test confession.";
        
        assertThat(duplicateDetectionService.isDuplicate(content)).isFalse();
        assertThat(duplicateDetectionService.isDuplicate(content)).isTrue();
    }

    @Test
    void testIsDuplicateNormalizedMatch() {
        String content1 = "This is a test confession!!!";
        String content2 = "this is a test confession";
        
        assertThat(duplicateDetectionService.isDuplicate(content1)).isFalse();
        assertThat(duplicateDetectionService.isDuplicate(content2)).isTrue();
    }
}
