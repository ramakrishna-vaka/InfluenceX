package com.project.InfluenceX.model;

import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public class PostRequestDTO {
    private long userId;
    private String campaignTitle;
    private String campaignDescription;
    private int budget;
    private String deadline;
    private String location;
    private String type;
    private String[] platforms;
    private MultipartFile image;
    private List<ApplicationDTO> applicationDTOList;
    private String followers;


    // getters ...
    public long getUserId() { return userId; }
    public String getCampaignTitle() { return campaignTitle; }
    public String getCampaignDescription() { return campaignDescription; }
    public int getBudget() { return budget; }
    public String getDeadline() { return deadline; }
    public String getLocation() { return location; }
    public String getType() { return type; }
    public String[] getPlatforms() { return platforms; }
    public MultipartFile getImage() { return image; }
    public List<ApplicationDTO> getApplicationDTOList(){ return applicationDTOList; }
    public String getFollowers(){return followers; }

    // ✅ setters
    public void setUserId(long userId) { this.userId = userId; }
    public void setCampaignTitle(String campaignTitle) { this.campaignTitle = campaignTitle; }
    public void setCampaignDescription(String campaignDescription) { this.campaignDescription = campaignDescription; }
    public void setBudget(int budget) { this.budget = budget; }
    public void setDeadline(String deadline) { this.deadline = deadline; }
    public void setLocation(String location) { this.location = location; }
    public void setType(String type) { this.type = type; }
    public void setPlatforms(String[] platforms) { this.platforms = platforms; }
    public void setImage(MultipartFile image) { this.image = image; }
    public void setFollowers(String followers){ this.followers=followers; }
}

