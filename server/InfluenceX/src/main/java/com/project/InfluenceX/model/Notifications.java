package com.project.InfluenceX.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
public class Notifications {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String notification;

    private boolean readBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "NotifiedUser", nullable = false)
    @JsonIgnore
    private User user;

    public void setReadBy(boolean readBy){
        this.readBy=readBy;
    }

    public void setNotification(String notification){
        this.notification=notification;
    }

    public void setUser(User user){
        this.user=user;
    }

    public Long getId(){
        return this.id;
    }

    public String getNotification(){
        return this.notification;
    }

    public boolean getReadBy(){
        return this.readBy;
    }


}
