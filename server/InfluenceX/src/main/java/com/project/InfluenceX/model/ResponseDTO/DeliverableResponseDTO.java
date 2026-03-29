package com.project.InfluenceX.model.ResponseDTO;

public class DeliverableResponseDTO {
    private String type;
    private String url;
    private String imageUrl;

    public String getType(){
        return type;
    }

    public String getUrl(){
        return url;
    }

    public String getImageUrl(){
        return imageUrl;
    }

    public void setType(String type){
        this.type=type;
    }

    public void setUrl(String url){
        this.url = url;
    }

    public void setImageUrl(String imageUrl){
        this.imageUrl=imageUrl;
    }
}
