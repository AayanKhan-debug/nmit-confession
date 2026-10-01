package com.nmit.confessions.entity;

import com.nmit.confessions.enums.ReactionType;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "reactions", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"confession_id", "voter_token_hash", "reaction_type"})
})
public class Reaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "confession_id", nullable = false)
    private Confession confession;

    @Enumerated(EnumType.STRING)
    @Column(name = "reaction_type", nullable = false, length = 20)
    private ReactionType reactionType;

    @Column(name = "voter_token_hash", nullable = false, length = 128)
    private String voterTokenHash;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Confession getConfession() { return confession; }
    public void setConfession(Confession confession) { this.confession = confession; }

    public ReactionType getReactionType() { return reactionType; }
    public void setReactionType(ReactionType reactionType) { this.reactionType = reactionType; }

    public String getVoterTokenHash() { return voterTokenHash; }
    public void setVoterTokenHash(String voterTokenHash) { this.voterTokenHash = voterTokenHash; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
