package com.nmit.confessions.service;

import com.nmit.confessions.dto.ReactionResponse;
import com.nmit.confessions.entity.Confession;
import com.nmit.confessions.entity.Reaction;
import com.nmit.confessions.enums.ConfessionStatus;
import com.nmit.confessions.enums.ReactionType;
import com.nmit.confessions.exception.DuplicateReactionException;
import com.nmit.confessions.exception.ResourceNotFoundException;
import com.nmit.confessions.repository.ConfessionRepository;
import com.nmit.confessions.repository.ReactionRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReactionService {

    private final ReactionRepository reactionRepository;
    private final ConfessionRepository confessionRepository;
    private final DeviceTokenService deviceTokenService;

    public ReactionService(ReactionRepository reactionRepository, 
                           ConfessionRepository confessionRepository, 
                           DeviceTokenService deviceTokenService) {
        this.reactionRepository = reactionRepository;
        this.confessionRepository = confessionRepository;
        this.deviceTokenService = deviceTokenService;
    }

    @Transactional
    public ReactionResponse addReaction(Long confessionId, ReactionType type, String rawToken) {
        if (rawToken == null) {
            throw new IllegalArgumentException("Device token is required");
        }

        Confession confession = confessionRepository.findById(confessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Confession not found"));

        // Only PUBLISHED confessions can receive reactions
        if (confession.getStatus() != ConfessionStatus.PUBLISHED) {
            throw new ResourceNotFoundException("Confession not found");
        }

        String tokenHash = deviceTokenService.hashToken(rawToken);

        Reaction reaction = new Reaction();
        reaction.setConfession(confession);
        reaction.setReactionType(type);
        reaction.setVoterTokenHash(tokenHash);

        try {
            reactionRepository.saveAndFlush(reaction);
        } catch (DataIntegrityViolationException e) {
            throw new DuplicateReactionException("Reaction already added by this device.");
        }

        // Atomically increment counter
        switch (type) {
            case LOVE:
                confessionRepository.incrementLoveCount(confessionId);
                break;
            case FUNNY:
                confessionRepository.incrementFunnyCount(confessionId);
                break;
            case SAD:
                confessionRepository.incrementSadCount(confessionId);
                break;
            case FIRE:
                confessionRepository.incrementFireCount(confessionId);
                break;
        }

        return new ReactionResponse("Reaction added successfully.");
    }
}
