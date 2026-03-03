package com.project.InfluenceX.model.ResponseDTO;

import com.project.InfluenceX.model.ApplicationStatus;

import java.util.List;

public class MyCollaborationsResponseDTO {

    private String postId;
    private String postName;
    private String applicationId;
    private String userId;
    private String userName;
    private List<ApplicationStatus> applicationStatus;
    private String postDeadline;

    public MyCollaborationsResponseDTO(){

    }

    public MyCollaborationsResponseDTO(String postId,String postName,String applicationId, String userName,String userId,List<ApplicationStatus> applicationStatus, String postDeadline){
        this.userName=userName;
        this.applicationStatus=applicationStatus;
        this.userId=userId;
        this.postId=postId;
        this.postName=postName;
        this.applicationId=applicationId;
        this.postDeadline=postDeadline;
    }

    public String getPostId(){
        return postId;
    }

    public String getPostName(){
        return postName;
    }

    public String getApplicationId(){
        return applicationId;
    }

    public String getUserId(){
        return userId;
    }

    public String getUserName(){
        return  userName;
    }

    public String getPostDeadline(){
        return postDeadline;
    }

    public void setPostId(String postId){
        this.postId=postId;
    }

    public void setPostName(String postName){
        this.postName=postName;
    }

    public void setApplicationId(String applicationId){
        this.applicationId=applicationId;
    }

    public void setUserId(String userId){
        this.userId=userId;
    }

    public void setUserName(String userName){
        this.userName=userName;
    }

    public void setPostDeadline(String postDeadline){
        this.postDeadline=postDeadline;
    }

    public List<ApplicationStatus> getApplicationStatus() {
        return applicationStatus;
    }

    public void setApplicationStatus(List<ApplicationStatus> applicationStatus) {
        this.applicationStatus = applicationStatus;
    }

}
