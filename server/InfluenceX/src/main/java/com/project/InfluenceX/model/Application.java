package com.project.InfluenceX.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.Optional;

@Entity
@Table(
        name = "applications",
        uniqueConstraints = @UniqueConstraint(columnNames = {"post_id", "influencer_id"})
)
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    @JsonIgnoreProperties({"applications"})   // prevents infinite loop
    private Posts post;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "influencer_id", nullable = false)
    private User influencer;

    @Column(name = "pitch_message", columnDefinition = "TEXT")
    private String pitchMessage; // Influencer's proposal

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApplicationStatusEnum status = ApplicationStatusEnum.Pending;

    @Column(name = "brand_feedback", columnDefinition = "TEXT")
    private String brandFeedback; // Optional feedback from brand when accepting/rejecting

    @Column(name = "applied_at", nullable = false)
    private LocalDateTime appliedAt = LocalDateTime.now();

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    // Constructors
    public Application() {}

    public Application(Posts post, User influencer, String pitchMessage) {
        this.post = post;
        this.influencer = influencer;
        this.pitchMessage = pitchMessage;
        this.status = ApplicationStatusEnum.Pending;
        this.appliedAt = LocalDateTime.now();
    }

    // ---------- GETTERS ----------
    public Long getId() {
        return id;
    }

    public Posts getPost() {
        return post;
    }

    public User getInfluencer() {
        return influencer;
    }

    public String getPitchMessage() {
        return pitchMessage;
    }

    public ApplicationStatusEnum getStatus() {
        return status;
    }

    public String getBrandFeedback() {
        return brandFeedback;
    }

    public LocalDateTime getAppliedAt() {
        return appliedAt;
    }

    public LocalDateTime getReviewedAt() {
        return reviewedAt;
    }

    // ---------- SETTERS ----------
    public void setId(Long id) {
        this.id = id;
    }

    public void setPost(Posts post) {
        this.post = post;
    }

    public void setInfluencer(User influencer) {
        this.influencer = influencer;
    }

    public void setPitchMessage(String pitchMessage) {
        this.pitchMessage = pitchMessage;
    }

    public void setStatus(ApplicationStatusEnum status) {
        this.status = status;
        // Auto-set reviewed timestamp when status changes from PENDING
        if (status != ApplicationStatusEnum.Pending && this.reviewedAt == null) {
            this.reviewedAt = LocalDateTime.now();
        }
    }

    public void setBrandFeedback(String brandFeedback) {
        this.brandFeedback = brandFeedback;
    }

    public void setAppliedAt(LocalDateTime appliedAt) {
        this.appliedAt = appliedAt;
    }

    public void setReviewedAt(LocalDateTime reviewedAt) {
        this.reviewedAt = reviewedAt;
    }

    // ---------- BUSINESS LOGIC METHODS ----------

    /**
     * Accept this application with optional feedback
     */
    public void accept(String feedback) {
        this.status = ApplicationStatusEnum.Accepted;
        this.brandFeedback = feedback;
        this.reviewedAt = LocalDateTime.now();
    }

    /**
     * Reject this application with optional feedback
     */
    public void reject(String feedback) {
        this.status = ApplicationStatusEnum.Rejected;
        this.brandFeedback = feedback;
        this.reviewedAt = LocalDateTime.now();
    }

    /**
     * Influencer withdraws their application
     */
    public void withdraw() {
        if (this.status == ApplicationStatusEnum.Pending) {
            this.status = ApplicationStatusEnum.Withdraw;
            this.reviewedAt = LocalDateTime.now();
        } else {
            throw new IllegalStateException("Cannot withdraw application that has already been reviewed");
        }
    }

    /**
     * Check if application is still pending
     */
    public boolean isPending() {
        return this.status == ApplicationStatusEnum.Pending;
    }

    /**
     * Check if application was accepted
     */
    public boolean isAccepted() {
        return this.status == ApplicationStatusEnum.Accepted;
    }

    /**
     * Check if application was rejected
     */
    public boolean isRejected() {
        return this.status == ApplicationStatusEnum.Rejected;
    }

    /**
     * Check if application was withdrawn
     */
    public boolean isWithdrawn() {
        return this.status == ApplicationStatusEnum.Withdraw;
    }

    /**
     * Check if brand can still review this application
     */
    public boolean canBeReviewed() {
        return this.status == ApplicationStatusEnum.Pending;
    }

    /**
     * Check if influencer can withdraw this application
     */
    public boolean canBeWithdrawn() {
        return this.status == ApplicationStatusEnum.Pending;
    }

    @Override
    public String toString() {
        return "Application{" +
                "id=" + id +
                ", postId=" + (post != null ? post.getId() : null) +
                ", influencerId=" + (influencer != null ? influencer.getId() : null) +
                ", status=" + status +
                ", appliedAt=" + appliedAt +
                '}';
    }
}