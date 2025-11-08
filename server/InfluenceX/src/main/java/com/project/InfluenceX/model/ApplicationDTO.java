package com.project.InfluenceX.model;

public class ApplicationDTO {
    Long postId;
    Long influencerId;
    String pitchMessage;

    public Long getPostId(){
        return postId;
    }

    public Long getInfluencerId(){
        return influencerId;
    }

    public String getPitchMessage(){
        return pitchMessage;
    }

}
