package com.project.InfluenceX.model;

import java.util.List;

public class PostResponseDTO {

    private long id;
    private UserDTO createdBy;

    private String title;
    private String description;

    private int budget;
    private String deadline;
    private String location;
    private String type;
    private String[] platformsNeeded;
    private String followers;

    private List<ApplicationDTO> applications;
    private int applicants;
    private int openRoles;
    private String postStatus;

    private String imageBase64;   // Base64 string for UI

    private boolean isCreatedByMe;
    private String updatedAt;
    private String createdAt;
    private String compensationType;
    private String compensationDescription;
    private String deliverables;

    // --- Getters ---
    public long getId() { return id; }
    public UserDTO getCreatedBy() { return createdBy; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public int getBudget() { return budget; }
    public String getDeadline() { return deadline; }
    public String getLocation() { return location; }
    public String getType() { return type; }
    public String[] getPlatformsNeeded() { return platformsNeeded; }
    public String getFollowers(){ return followers; }
    public List<ApplicationDTO> getApplications() { return applications; }
    public int getApplicants() { return applicants; }
    public int getOpenRoles() { return openRoles; }
    public String getPostStatus() { return postStatus; }
    public String getImageBase64() { return imageBase64; }
    public boolean getIsCreatedByMe() { return isCreatedByMe; }
    public String getUpdatedAt(){ return updatedAt; }
    public String getCompensationType(){ return compensationType; }
    public String getCompensationDescription(){ return compensationDescription; }
    public String getDeliverables(){ return deliverables; }
    public String getCreatedAt(){ return createdAt; }

    // --- Setters ---
    public void setId(long id) { this.id = id; }
    public void setCreatedBy(UserDTO createdBy) { this.createdBy = createdBy; }
    public void setTitle(String title) { this.title = title; }
    public void setDescription(String description) { this.description = description; }
    public void setBudget(int budget) { this.budget = budget; }
    public void setDeadline(String deadline) { this.deadline = deadline; }
    public void setLocation(String location) { this.location = location; }
    public void setType(String type) { this.type = type; }
    public void setPlatformsNeeded(String[] platformsNeeded) { this.platformsNeeded = platformsNeeded; }
    public void setFollowers(String followers){ this.followers=followers; }
    public void setApplications(List<ApplicationDTO> applications) { this.applications = applications; }
    public void setApplicants(int applicants) { this.applicants = applicants; }
    public void setOpenRoles(int openRoles) { this.openRoles = openRoles; }
    public void setPostStatus(String postStatus) { this.postStatus = postStatus; }
    public void setImageBase64(String imageBase64) { this.imageBase64 = imageBase64; }
    public void setCreatedByMe(boolean isCreatedByMe){ this.isCreatedByMe=isCreatedByMe; }
    public void setCompensationType(String compensationType){ this.compensationType=compensationType;}
    public void setCompensationDescription(String compensationDescription) { this.compensationDescription=compensationDescription; }
    public void setUpdatedAt(String updatedAt){ this.updatedAt=updatedAt; }
    public void setDeliverables(String deliverables){ this.deliverables= deliverables; }
    public void setCreatedAt(String createdAt){ this.createdAt=createdAt;}
}
