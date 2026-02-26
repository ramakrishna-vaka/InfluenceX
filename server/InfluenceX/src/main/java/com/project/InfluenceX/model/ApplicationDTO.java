package com.project.InfluenceX.model;

import java.time.LocalDateTime;

public class ApplicationDTO {
    Long postId;
    Long influencerId;
    String pitchMessage;
    LocalDateTime appliedAt;
    String applicationStatus;

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

    public String getApplicationStatus() { return applicationStatus; }

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

    public void setApplicationStatus(String applicationStatus){
        this.applicationStatus=applicationStatus;
    }

}
