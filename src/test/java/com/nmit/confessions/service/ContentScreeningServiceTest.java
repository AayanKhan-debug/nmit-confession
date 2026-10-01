package com.nmit.confessions.service;

import com.nmit.confessions.enums.ScreeningFlag;
import com.nmit.confessions.service.impl.ContentScreeningServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

class ContentScreeningServiceTest {

    private ContentScreeningService screeningService;

    @BeforeEach
    void setUp() {
        screeningService = new ContentScreeningServiceImpl();
    }

    @Test
    void testNormalConfession() {
        Set<ScreeningFlag> flags = screeningService.screenContent("Just a normal day on campus.");
        assertThat(flags).isEmpty();
    }

    @Test
    void testEmailDetection() {
        Set<ScreeningFlag> flags = screeningService.screenContent("Contact me at test@example.com for info.");
        assertThat(flags).containsExactly(ScreeningFlag.PERSONAL_INFORMATION);
    }

    @Test
    void testPhoneNumberDetection() {
        Set<ScreeningFlag> flags = screeningService.screenContent("Call me 123-456-7890 if you agree.");
        assertThat(flags).containsExactly(ScreeningFlag.PERSONAL_INFORMATION);
    }

    @Test
    void testUrlDetection() {
        Set<ScreeningFlag> flags = screeningService.screenContent("Check out http://suspicious-site.com/virus");
        assertThat(flags).containsExactly(ScreeningFlag.SUSPICIOUS_LINK);
    }

    @Test
    void testProfanityDetection() {
        Set<ScreeningFlag> flags = screeningService.screenContent("This exam was bullshit and a fuck up.");
        assertThat(flags).containsExactly(ScreeningFlag.PROFANITY);
    }

    @Test
    void testHarassmentDetection() {
        Set<ScreeningFlag> flags = screeningService.screenContent("You are such a loser, hate you.");
        assertThat(flags).containsExactly(ScreeningFlag.HARASSMENT);
    }

    @Test
    void testSensitiveContentDetection() {
        Set<ScreeningFlag> flags = screeningService.screenContent("I am so depressed.");
        assertThat(flags).containsExactly(ScreeningFlag.SENSITIVE_CONTENT);
    }

    @Test
    void testMultipleFlagsCoexist() {
        Set<ScreeningFlag> flags = screeningService.screenContent("Fuck this, check out http://bad.com or call 123-456-7890.");
        assertThat(flags).containsExactlyInAnyOrder(
                ScreeningFlag.PROFANITY,
                ScreeningFlag.SUSPICIOUS_LINK,
                ScreeningFlag.PERSONAL_INFORMATION
        );
    }
}
