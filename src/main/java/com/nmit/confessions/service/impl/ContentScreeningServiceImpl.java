package com.nmit.confessions.service.impl;

import com.nmit.confessions.enums.ScreeningFlag;
import com.nmit.confessions.service.ContentScreeningService;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Set;
import java.util.regex.Pattern;

@Service
public class ContentScreeningServiceImpl implements ContentScreeningService {

    private static final Pattern PHONE_PATTERN = Pattern.compile("\\b\\d{10}\\b|\\b\\d{3}[-.]?\\d{3}[-.]?\\d{4}\\b");
    private static final Pattern EMAIL_PATTERN = Pattern.compile("\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b");
    private static final Pattern URL_PATTERN = Pattern.compile("(?i)\\b(https?://|www\\.)[-A-Za-z0-9+&@#/%?=~_()|!:,.;]*[-A-Za-z0-9+&@#/%=~_()|]");
    
    // Simplistic word lists for phase 1
    private static final String[] PROFANITY_WORDS = {"fuck", "shit", "bitch", "asshole", "cunt"};
    private static final String[] HARASSMENT_WORDS = {"kill yourself", "die", "ugly", "loser", "hate you"};
    private static final String[] SENSITIVE_WORDS = {"suicide", "cut myself", "depressed", "want to die", "self harm"};

    @Override
    public Set<ScreeningFlag> screenContent(String content) {
        Set<ScreeningFlag> flags = new HashSet<>();
        if (content == null || content.isEmpty()) {
            return flags;
        }

        String lowerContent = content.toLowerCase();

        if (PHONE_PATTERN.matcher(content).find() || EMAIL_PATTERN.matcher(content).find()) {
            flags.add(ScreeningFlag.PERSONAL_INFORMATION);
        }

        if (URL_PATTERN.matcher(content).find()) {
            flags.add(ScreeningFlag.SUSPICIOUS_LINK);
        }

        for (String word : PROFANITY_WORDS) {
            if (lowerContent.contains(word)) {
                flags.add(ScreeningFlag.PROFANITY);
                break;
            }
        }

        for (String word : HARASSMENT_WORDS) {
            if (lowerContent.contains(word)) {
                flags.add(ScreeningFlag.HARASSMENT);
                break;
            }
        }

        for (String word : SENSITIVE_WORDS) {
            if (lowerContent.contains(word)) {
                flags.add(ScreeningFlag.SENSITIVE_CONTENT);
                break;
            }
        }

        return flags;
    }
}
