package com.project.InfluenceX.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // -------- BASIC INFO --------

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    @Column(length = 15)
    private String phoneNumber;

    @Column(unique = true)
    private String username;

    // -------- PROFILE INFO --------

    @Basic(fetch = FetchType.LAZY)
    @Column(name = "image_data", length = 10485760)
    private byte[] imageData;

    @Column(length = 500)
    private String bio;

    @Column
    private String location;

    @Enumerated(EnumType.STRING)
    private UserEnum role;

    @ElementCollection
    @CollectionTable(name = "user_preferred_categories", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "category")
    private List<String> preferredCategory;

    @ElementCollection
    @CollectionTable(name = "user_languages", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "language")
    private List<String> languagesKnown;

    @Column
    private boolean phoneVerified;

    @Column
    private String website;

    @Column
    private String address;

    // -------- SOCIAL MEDIA --------

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<SocialMediaProfile> socialMediaProfiles;

    // -------- POSTS --------

    @OneToMany(mappedBy = "createdBy", cascade = CascadeType.ALL)
    private List<Posts> postsCreated;

    // -------- RATINGS --------

    @Column
    private double averageRating = 0.0;

    @Column
    private int ratingCount = 0;

    // -------- PLATFORM METRICS --------

    @Column
    private int totalCollaborations = 0;

    @Column
    private double totalEarnings = 0.0;

    // -------- ACCOUNT STATUS --------

    @Column
    private boolean active = true;

    @Column
    private boolean verified = false;

    // -------- AUDIT FIELDS --------

    @Column
    private LocalDateTime createdAt;

    @Column
    private LocalDateTime updatedAt;

    @Column
    private LocalDateTime lastLoginAt;

    // -------- CONSTRUCTORS --------

    public User() {}

    public User(String email, String passwordHash) {
        this.email = email;
        this.passwordHash = passwordHash;
    }

    // -------- GETTERS & SETTERS --------

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return passwordHash; }
    public void setPassword(String passwordHash) { this.passwordHash = passwordHash; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public byte[] getImageData() { return imageData; }
    public void setImageData(byte[] imageData) { this.imageData = imageData; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public UserEnum getRole() { return role; }
    public void setRole(UserEnum role) { this.role = role; }

    public List<SocialMediaProfile> getSocialMediaProfiles() { return socialMediaProfiles; }
    public void setSocialMediaProfiles(List<SocialMediaProfile> socialMediaProfiles) { this.socialMediaProfiles = socialMediaProfiles; }

    public List<Posts> getPostsCreated() { return postsCreated; }
    public void setPostsCreated(List<Posts> postsCreated) { this.postsCreated = postsCreated; }

    public double getAverageRating() { return averageRating; }
    public void setAverageRating(double averageRating) { this.averageRating = averageRating; }

    public int getRatingCount() { return ratingCount; }
    public void setRatingCount(int ratingCount) { this.ratingCount = ratingCount; }

    public int getTotalCollaborations() { return totalCollaborations; }
    public void setTotalCollaborations(int totalCollaborations) { this.totalCollaborations = totalCollaborations; }

    public double getTotalEarnings() { return totalEarnings; }
    public void setTotalEarnings(double totalEarnings) { this.totalEarnings = totalEarnings; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public boolean isVerified() { return verified; }
    public void setVerified(boolean verified) { this.verified = verified; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public LocalDateTime getLastLoginAt() { return lastLoginAt; }
    public void setLastLoginAt(LocalDateTime lastLoginAt) { this.lastLoginAt = lastLoginAt; }

    public List<String> getPreferredCategory() {
        return preferredCategory;
    }

    public void setPreferredCategory(List<String> preferredCategory) {
        this.preferredCategory = preferredCategory;
    }

    public List<String> getLanguagesKnown() {
        return languagesKnown;
    }

    public void setLanguagesKnown(List<String> languagesKnown) {
        this.languagesKnown = languagesKnown;
    }

    public boolean isPhoneVerified() {
        return phoneVerified;
    }

    public void setPhoneVerified(boolean phoneVerified) {
        this.phoneVerified = phoneVerified;
    }

    public String getWebsite() {
        return website;
    }

    public void setWebsite(String website) {
        this.website = website;
    }

    public void setAddress(String address){
        this.address=address;
    }
    public String getAddress(){
        return address;
    }


}
