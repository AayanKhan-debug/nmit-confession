package com.nmit.confessions.entity;

import com.nmit.confessions.enums.ConfessionCategory;
import com.nmit.confessions.enums.ConfessionStatus;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.HashSet;
import java.util.Set;
import com.nmit.confessions.enums.ScreeningFlag;


@Entity
@Table(name = "confessions", indexes = {
    @Index(name = "idx_confession_status", columnList = "status"),
    @Index(name = "idx_confession_status_date", columnList = "status, createdAt"),
    @Index(name = "idx_confession_cat_status_date", columnList = "category, status, createdAt")
})
public class Confession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 255)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ConfessionCategory category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ConfessionStatus status = ConfessionStatus.PENDING;

    @Column(columnDefinition = "TEXT")
    private String rejectionReason;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "moderated_by")
    private Admin moderatedBy;

    private Instant moderatedAt;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    private Instant publishedAt;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "confession_screening_flags", joinColumns = @JoinColumn(name = "confession_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "flag")
    private Set<ScreeningFlag> screeningFlags = new HashSet<>();
    
    public Set<ScreeningFlag> getScreeningFlags() { return screeningFlags; }
    public void setScreeningFlags(Set<ScreeningFlag> screeningFlags) { this.screeningFlags = screeningFlags; }


    // Reaction counters
    @Column(nullable = false)
    private int reactionLoveCount = 0;

    @Column(nullable = false)
    private int reactionFunnyCount = 0;

    @Column(nullable = false)
    private int reactionSadCount = 0;

    @Column(nullable = false)
    private int reactionFireCount = 0;

    // Report counter
    @Column(nullable = false)
    private int reportCount = 0;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public ConfessionCategory getCategory() { return category; }
    public void setCategory(ConfessionCategory category) { this.category = category; }

    public ConfessionStatus getStatus() { return status; }
    public void setStatus(ConfessionStatus status) { this.status = status; }

    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }

    public Admin getModeratedBy() { return moderatedBy; }
    public void setModeratedBy(Admin moderatedBy) { this.moderatedBy = moderatedBy; }

    public Instant getModeratedAt() { return moderatedAt; }
    public void setModeratedAt(Instant moderatedAt) { this.moderatedAt = moderatedAt; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getPublishedAt() { return publishedAt; }
    public void setPublishedAt(Instant publishedAt) { this.publishedAt = publishedAt; }

    public int getReactionLoveCount() { return reactionLoveCount; }
    public void setReactionLoveCount(int reactionLoveCount) { this.reactionLoveCount = reactionLoveCount; }

    public int getReactionFunnyCount() { return reactionFunnyCount; }
    public void setReactionFunnyCount(int reactionFunnyCount) { this.reactionFunnyCount = reactionFunnyCount; }

    public int getReactionSadCount() { return reactionSadCount; }
    public void setReactionSadCount(int reactionSadCount) { this.reactionSadCount = reactionSadCount; }

    public int getReactionFireCount() { return reactionFireCount; }
    public void setReactionFireCount(int reactionFireCount) { this.reactionFireCount = reactionFireCount; }

    public int getReportCount() { return reportCount; }
    public void setReportCount(int reportCount) { this.reportCount = reportCount; }
}
