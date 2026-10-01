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

    @Test
    void testObfuscatedEmailDetection() {
        Set<ScreeningFlag> flags = screeningService.screenContent("Contact me at test @ example . com for info.");
        assertThat(flags).contains(ScreeningFlag.PERSONAL_INFORMATION);
        
        Set<ScreeningFlag> flags2 = screeningService.screenContent("Reach me at hello(at)gmail.com");
        assertThat(flags2).contains(ScreeningFlag.PERSONAL_INFORMATION);
    }

    @Test
    void testObfuscatedPhoneNumberDetection() {
        Set<ScreeningFlag> flags = screeningService.screenContent("Call me 9 8 7 6 5 4 3 2 1 0 if you agree.");
        assertThat(flags).contains(ScreeningFlag.PERSONAL_INFORMATION);
    }

    @Test
    void testObfuscatedUrlDetection() {
        Set<ScreeningFlag> flags = screeningService.screenContent("Check out h t t p : / / google . com for this.");
        assertThat(flags).contains(ScreeningFlag.SUSPICIOUS_LINK);
    }

    @Test
    void testObfuscatedProfanityDetection() {
        Set<ScreeningFlag> flags = screeningService.screenContent("What the f u c k is this.");
        assertThat(flags).contains(ScreeningFlag.PROFANITY);
        
        Set<ScreeningFlag> flags2 = screeningService.screenContent("This is f.u.c.k.");
        assertThat(flags2).contains(ScreeningFlag.PROFANITY);
    }
}
