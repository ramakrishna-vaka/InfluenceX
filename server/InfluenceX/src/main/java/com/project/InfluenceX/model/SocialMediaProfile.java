package com.project.InfluenceX.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "social_media_profiles",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"user_id", "platform"})
        })
public class SocialMediaProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Many profiles belong to one user
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Platform type (Instagram, YouTube, etc.)
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SocialPlatform platform;

    // Username/handle on that platform
    @Column(nullable = false)
    private String username;

    // Display handle (optional)
    private String handle;

    // Profile link
    private String profileUrl;

    // Metrics
    @Column
    private long followersCount = 0;

    @Column
    private double engagementRate = 0.0;

    // Audit fields
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // -------- CONSTRUCTORS --------

    public SocialMediaProfile() {}

    public SocialMediaProfile(User user, SocialPlatform platform, String username) {
        this.user = user;
        this.platform = platform;
        this.username = username;
    }

    // -------- GETTERS & SETTERS --------

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public SocialPlatform getPlatform() {
        return platform;
    }

    public void setPlatform(SocialPlatform platform) {
        this.platform = platform;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getHandle() {
        return handle;
    }

    public void setHandle(String handle) {
        this.handle = handle;
    }

    public String getProfileUrl() {
        return profileUrl;
    }

    public void setProfileUrl(String profileUrl) {
        this.profileUrl = profileUrl;
    }

    public long getFollowersCount() {
        return followersCount;
    }

    public void setFollowersCount(long followersCount) {
        this.followersCount = followersCount;
    }

    public double getEngagementRate() {
        return engagementRate;
    }

    public void setEngagementRate(double engagementRate) {
        this.engagementRate = engagementRate;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
