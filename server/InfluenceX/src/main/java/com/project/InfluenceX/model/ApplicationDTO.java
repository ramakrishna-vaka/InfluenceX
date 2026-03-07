package com.project.InfluenceX.model;

import java.time.LocalDateTime;
import java.util.List;

public class ApplicationDTO {
    Long postId;
    Long influencerId;
    String pitchMessage;
    LocalDateTime appliedAt;
    List<ApplicationStatus> applicationStatus;
    String influencerImage;
    String influencerName;
    String currentStatus;
    String applicationId;

    public Long getPostId(){
        return postId;
    }

    public Long getInfluencerId(){
        return influencerId;
    }

    public String getPitchMessage(){
        return pitchMessage;
    }

    public LocalDateTime getAppliedAt(){ return appliedAt; }

    public List<ApplicationStatus> getApplicationStatus() { return applicationStatus; }

    public String getInfluencerImage(){
        return influencerImage;
    }
    
    public String getInfluencerName(){
        return influencerName;
    }

    public String getCurrentStatus(){
        return currentStatus;
    }

    public String getApplicationId(){
        return applicationId;
    }

    public void setPostId(Long postId){
        this.postId=postId;
    }

    public void setInfluencerId(Long influencerId){
        this.influencerId=influencerId;
    }

    public void setPitchMessage(String pitchMessage){
        this.pitchMessage=pitchMessage;
    }

    public void setAppliedAt(LocalDateTime appliedAt){ this.appliedAt=appliedAt; }

    public void setApplicationStatus(List<ApplicationStatus> applicationStatus){
        this.applicationStatus=applicationStatus;
    }

    public void setInfluencerImage(String influencerImage){
        this.influencerImage=influencerImage;
    }
    
    public void setInfluencerName(String influencerName){
        this.influencerName=influencerName;
    }

    public void setCurrentStatus(String currentStatus){
        this.currentStatus=currentStatus;
    }

    public void setApplicationId(String applicationId){
        this.applicationId=applicationId;
    }

}
