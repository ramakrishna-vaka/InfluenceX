package com.project.InfluenceX.model.ResponseDTO;

import com.project.InfluenceX.model.UserEnum;
import java.time.LocalDateTime;
import java.util.List;

public class ProfileResponseDTO {

    private Long id;
    private String name;
    private String email;
    private String phone;
    private String location;
    private String bio;
    private String category;
    private String username;
    private String avatar;
    private String coverImage;
    private UserEnum role;
    private boolean verified;
    private boolean phoneVerified;
    private List<SocialMediaProfileDTO> socialMediaProfiles;
    private ProfileStatsDTO stats;
    private List<PostSummaryDTO> createdPosts;
    private List<CollaborationSummaryDTO> collaborations;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<String> preferredCategories;
    private List<String> languagesKnown;


    // Inner class for stats
    public static class ProfileStatsDTO {
        private int totalCollaborations;
        private int activeCollaborations;
        private int completedCollaborations;
        private double totalEarnings;
        private double avgRating;
        private int ratingCount;
        private int totalPosts;

        public ProfileStatsDTO() {}

        public ProfileStatsDTO(int totalCollaborations, int activeCollaborations,
                               int completedCollaborations, double totalEarnings,
                               double avgRating, int ratingCount, int totalPosts) {
            this.totalCollaborations = totalCollaborations;
            this.activeCollaborations = activeCollaborations;
            this.completedCollaborations = completedCollaborations;
            this.totalEarnings = totalEarnings;
            this.avgRating = avgRating;
            this.ratingCount = ratingCount;
            this.totalPosts = totalPosts;
        }

        // Getters and Setters
        public int getTotalCollaborations() { return totalCollaborations; }
        public void setTotalCollaborations(int totalCollaborations) { this.totalCollaborations = totalCollaborations; }

        public int getActiveCollaborations() { return activeCollaborations; }
        public void setActiveCollaborations(int activeCollaborations) { this.activeCollaborations = activeCollaborations; }

        public int getCompletedCollaborations() { return completedCollaborations; }
        public void setCompletedCollaborations(int completedCollaborations) { this.completedCollaborations = completedCollaborations; }

        public double getTotalEarnings() { return totalEarnings; }
        public void setTotalEarnings(double totalEarnings) { this.totalEarnings = totalEarnings; }

        public double getAvgRating() { return avgRating; }
        public void setAvgRating(double avgRating) { this.avgRating = avgRating; }

        public int getRatingCount() { return ratingCount; }
        public void setRatingCount(int ratingCount) { this.ratingCount = ratingCount; }

        public int getTotalPosts() { return totalPosts; }
        public void setTotalPosts(int totalPosts) { this.totalPosts = totalPosts; }
    }

    // Inner class for social media profile
    public static class SocialMediaProfileDTO {
        private Long id;
        private String platform;
        private String username;
        private String handle;
        private String profileUrl;
        private long followersCount;
        private double engagementRate;

        public SocialMediaProfileDTO() {}

        public SocialMediaProfileDTO(Long id, String platform, String username,
                                     String handle, String profileUrl,
                                     long followersCount, double engagementRate) {
            this.id = id;
            this.platform = platform;
            this.username = username;
            this.handle = handle;
            this.profileUrl = profileUrl;
            this.followersCount = followersCount;
            this.engagementRate = engagementRate;
        }

        // Getters and Setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getPlatform() { return platform; }
        public void setPlatform(String platform) { this.platform = platform; }

        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }

        public String getHandle() { return handle; }
        public void setHandle(String handle) { this.handle = handle; }

        public String getProfileUrl() { return profileUrl; }
        public void setProfileUrl(String profileUrl) { this.profileUrl = profileUrl; }

        public long getFollowersCount() { return followersCount; }
        public void setFollowersCount(long followersCount) { this.followersCount = followersCount; }

        public double getEngagementRate() { return engagementRate; }
        public void setEngagementRate(double engagementRate) { this.engagementRate = engagementRate; }
    }

    // Inner class for post summary
    public static class PostSummaryDTO {
        private Long id;
        private String title;
        private String description;
        private String status;
        private String createdAt;

        public PostSummaryDTO() {}

        public PostSummaryDTO(Long id, String title, String description,
                              String status, String createdAt) {
            this.id = id;
            this.title = title;
            this.description = description;
            this.status = status;
            this.createdAt = createdAt;
        }

        // Getters and Setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public String getCreatedAt() { return createdAt; }
        public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
    }

    // Inner class for collaboration summary
    public static class CollaborationSummaryDTO {
        private Long id;
        private String title;
        private String status;
        private double amount;
        private String updatedAt;

        public CollaborationSummaryDTO() {}

        public CollaborationSummaryDTO(Long id, String title, String status,
                                       double amount, String updatedAt) {
            this.id = id;
            this.title = title;
            this.status = status;
            this.amount = amount;
            this.updatedAt = updatedAt;
        }

        // Getters and Setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public double getAmount() { return amount; }
        public void setAmount(double amount) { this.amount = amount; }

        public String getUpdatedAt() { return updatedAt; }
        public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }
    }

    // Constructors
    public ProfileResponseDTO() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }

    public String getCoverImage() { return coverImage; }
    public void setCoverImage(String coverImage) { this.coverImage = coverImage; }

    public UserEnum getRole() { return role; }
    public void setRole(UserEnum role) { this.role = role; }

    public boolean isVerified() { return verified; }
    public void setVerified(boolean verified) { this.verified = verified; }

    public boolean isPhoneVerified() { return phoneVerified; }
    public void setPhoneVerified(boolean phoneVerified) { this.phoneVerified = phoneVerified; }

    public List<SocialMediaProfileDTO> getSocialMediaProfiles() { return socialMediaProfiles; }
    public void setSocialMediaProfiles(List<SocialMediaProfileDTO> socialMediaProfiles) {
        this.socialMediaProfiles = socialMediaProfiles;
    }

    public ProfileStatsDTO getStats() { return stats; }
    public void setStats(ProfileStatsDTO stats) { this.stats = stats; }

    public List<PostSummaryDTO> getCreatedPosts() { return createdPosts; }
    public void setCreatedPosts(List<PostSummaryDTO> createdPosts) { this.createdPosts = createdPosts; }

    public List<CollaborationSummaryDTO> getCollaborations() { return collaborations; }
    public void setCollaborations(List<CollaborationSummaryDTO> collaborations) {
        this.collaborations = collaborations;
    }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public void setUpdatedAt(LocalDateTime updatedAt){
        this.updatedAt=updatedAt;
    }

    public void setPreferredCategories(List<String> preferredCategories){
        this.preferredCategories=preferredCategories;
    }

    public List<String> getPreferredCategories() {
        return preferredCategories;
    }

    public List<String> getLanguagesKnown() {
        return languagesKnown;
    }


    public void setLanguagesKnown(List<String> languagesKnown){
        this.languagesKnown=languagesKnown;
    }
}
