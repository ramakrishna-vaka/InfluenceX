package com.project.InfluenceX.model;

public class NotificationDTO {
    private Long Id;
    private String notification;
    private boolean readBy;

    public NotificationDTO(Long Id,String notification,boolean readBy){
        this.Id=Id;
        this.notification=notification;
        this.readBy=readBy;
    }

    public Long getId(){
        return Id;
    }

    public String getNotification(){
        return  notification;
    }

    public boolean isReadBy(){
        return readBy;
    }


}
