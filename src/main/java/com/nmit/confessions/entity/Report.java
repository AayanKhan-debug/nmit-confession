package com.nmit.confessions.entity;

import com.nmit.confessions.enums.ReportReason;
import com.nmit.confessions.enums.ReportStatus;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "reports", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"confession_id", "reporter_token_hash"})
})
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "confession_id", nullable = false)
    private Confession confession;

    @Column(name = "reporter_token_hash", nullable = false, length = 128)
    private String reporterTokenHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ReportReason reason;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ReportStatus status = ReportStatus.PENDING;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    private Instant resolvedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resolved_by")
    private Admin resolvedBy;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Confession getConfession() { return confession; }
    public void setConfession(Confession confession) { this.confession = confession; }

    public String getReporterTokenHash() { return reporterTokenHash; }
    public void setReporterTokenHash(String reporterTokenHash) { this.reporterTokenHash = reporterTokenHash; }

    public ReportReason getReason() { return reason; }
    public void setReason(ReportReason reason) { this.reason = reason; }

    public ReportStatus getStatus() { return status; }
    public void setStatus(ReportStatus status) { this.status = status; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(Instant resolvedAt) { this.resolvedAt = resolvedAt; }

    public Admin getResolvedBy() { return resolvedBy; }
    public void setResolvedBy(Admin resolvedBy) { this.resolvedBy = resolvedBy; }
}
