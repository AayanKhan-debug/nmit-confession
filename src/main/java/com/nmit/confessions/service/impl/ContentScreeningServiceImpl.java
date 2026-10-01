package com.nmit.confessions.service.impl;

import com.nmit.confessions.enums.ScreeningFlag;
import com.nmit.confessions.service.ContentScreeningService;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Set;
import java.util.regex.Pattern;

@Service
public class ContentScreeningServiceImpl implements ContentScreeningService {

    // Improved Obfuscation-Aware Patterns
    
    // Allows for spaces, dots, dashes, and parentheses between digits
    private static final Pattern PHONE_PATTERN = Pattern.compile("(?i)(\\+?\\d[\\s\\-._]*){10,}");
    
    // Allows for (at) or [at] and spaces around dots
    private static final Pattern EMAIL_PATTERN = Pattern.compile("(?i)\\b[A-Za-z0-9._%+\\-]+(?:\\s*@\\s*|\\s*\\(?at\\)?\\s*|\\[at\\])[A-Za-z0-9.\\-]+\\s*\\.\\s*[A-Za-z]{2,}\\b");
    
    // Obfuscated domains or urls, but requires some context to prevent matching email domains directly, like requiring http or www
    private static final Pattern URL_PATTERN = Pattern.compile("(?i)(?:https?://|www\\.)[-A-Za-z0-9+&@#/%?=~_()|!:,.;]*[-A-Za-z0-9+&@#/%=~_()|]");
    
    private static final String[] PROFANITY_WORDS = {"fuck", "shit", "bitch", "asshole", "cunt"};
    private static final String[] HARASSMENT_WORDS = {"kill yourself", "die", "ugly", "loser", "hate you"};
    private static final String[] SENSITIVE_WORDS = {"suicide", "cut myself", "depressed", "want to die", "self harm"};

    @Override
    public Set<ScreeningFlag> screenContent(String content) {
        Set<ScreeningFlag> flags = new HashSet<>();
        if (content == null || content.trim().isEmpty()) {
            return flags;
        }

        // 1. Basic lowercasing
        String lowerContent = content.toLowerCase();
        
        // 3. Normalized punctuation version (removes special chars to prevent bypassing word filters like f.u.c.k)
        String noPunctuationContent = lowerContent.replaceAll("[^a-z0-9\\s]", " ");

        // 2. Whitespace-stripped normalized version from noPunctuationContent
        String noSpaceContent = noPunctuationContent.replaceAll("\\s+", "");

        String noSpaceWithPunctuation = lowerContent.replaceAll("\\s+", "");

        // Check Contact Info using slightly normalized text for spacing obfuscation
        if (PHONE_PATTERN.matcher(content).find() || PHONE_PATTERN.matcher(noSpaceWithPunctuation).find() || EMAIL_PATTERN.matcher(content).find() || EMAIL_PATTERN.matcher(noSpaceWithPunctuation).find()) {
            flags.add(ScreeningFlag.PERSONAL_INFORMATION);
        }

        // Check URLs against noSpaceContent as well to catch obfuscated links
        if (URL_PATTERN.matcher(content).find() || URL_PATTERN.matcher(noSpaceWithPunctuation).find()) {
            flags.add(ScreeningFlag.SUSPICIOUS_LINK);
        }

        // Check Word Lists against normalized strings
        for (String word : PROFANITY_WORDS) {
            String wordNoSpace = word.replaceAll("\\s+", "");
            if (lowerContent.contains(word) || noPunctuationContent.contains(word) || (wordNoSpace.length() > 3 && noSpaceContent.contains(wordNoSpace))) {
                flags.add(ScreeningFlag.PROFANITY);
                break;
            }
        }

        for (String word : HARASSMENT_WORDS) {
            String wordNoSpace = word.replaceAll("\\s+", "");
            if (lowerContent.contains(word) || noPunctuationContent.contains(word) || (wordNoSpace.length() > 5 && noSpaceContent.contains(wordNoSpace))) {
                flags.add(ScreeningFlag.HARASSMENT);
                break;
            }
        }

        for (String word : SENSITIVE_WORDS) {
            String wordNoSpace = word.replaceAll("\\s+", "");
            if (lowerContent.contains(word) || noPunctuationContent.contains(word) || (wordNoSpace.length() > 5 && noSpaceContent.contains(wordNoSpace))) {
                flags.add(ScreeningFlag.SENSITIVE_CONTENT);
                break;
            }
        }

        return flags;
    }
}
