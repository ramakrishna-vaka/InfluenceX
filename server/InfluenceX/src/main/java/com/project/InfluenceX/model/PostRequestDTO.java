package com.project.InfluenceX.model;

import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public class PostRequestDTO {
    private long userId;
    private String campaignTitle;
    private String campaignDescription;
    private String deadline;
    private String location;
    private String type;
    private String[] platforms;
    private MultipartFile image;
    private String followers;
    private String deliverables;
    private String compensationType;
    private String compensationDescription;
    private String applicationDeadline;
    private String postStatus;


    // getters ...
    public long getUserId() { return userId; }
    public String getCampaignTitle() { return campaignTitle; }
    public String getCampaignDescription() { return campaignDescription; }
    public String getDeadline() { return deadline; }
    public String getLocation() { return location; }
    public String getType() { return type; }
    public String[] getPlatforms() { return platforms; }
    public MultipartFile getImage() { return image; }
    public String getFollowers(){ return followers; }
    public String getDeliverables(){return deliverables; }
    public String getCompensationType(){return compensationType; }
    public String getCompensationDescription(){return compensationDescription; }
    public String getApplicationDeadline(){return applicationDeadline; }
    public String getPostStatus(){ return postStatus; }

    // ✅ setters
    public void setUserId(long userId) { this.userId = userId; }
    public void setCampaignTitle(String campaignTitle) { this.campaignTitle = campaignTitle; }
    public void setCampaignDescription(String campaignDescription) { this.campaignDescription = campaignDescription; }
    public void setDeadline(String deadline) { this.deadline = deadline; }
    public void setLocation(String location) { this.location = location; }
    public void setType(String type) { this.type = type; }
    public void setPlatforms(String[] platforms) { this.platforms = platforms; }
    public void setImage(MultipartFile image) { this.image = image; }
    public void setFollowers(String followers){ this.followers=followers; }
    public void setDeliverables(String deliverables){ this.deliverables = deliverables; }
    public void setCompensationType(String compensationType){ this.compensationType=compensationType; }
    public void setCompensationDescription(String compensationDescription){ this.compensationDescription=compensationDescription; }
    public void setApplicationDeadline(String applicationDeadline){ this.applicationDeadline=applicationDeadline;}
    public void setPostStatus(String postStatus){ this.postStatus=postStatus; }

}

