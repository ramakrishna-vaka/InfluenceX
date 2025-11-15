package com.project.InfluenceX.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
public class Chat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private User influencer;

    @ManyToOne
    private User brand;

    @OneToMany(mappedBy = "chatId",cascade = CascadeType.ALL)
    private List<Message> messageList;

    private String status;

    private LocalDateTime createdAt = LocalDateTime.now();

    public Chat(){
        this.createdAt=LocalDateTime.now();
    }

    public Chat(User brand,User influencer,Message message){
        this.brand=brand;
        this.influencer=influencer;
        this.createdAt=LocalDateTime.now();
        List<Message> messageList=new ArrayList<>();
        messageList.add(message);
        this.messageList=messageList;
        this.status="Pending";
    }

    public String getStatus(){ return this.status;}

    public User getInfluencer(){ return this.influencer; }

    public User getBrand() { return this.brand; }

    public List<Message> getMessageList(){
        return this.messageList;
    }

    public LocalDateTime getCreatedAt(){
        return this.createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setMessageList(List<Message> messageList) {
        this.messageList = messageList;
    }

    public void setInfluencer(User influencer) {
        this.influencer = influencer;
    }

    public void setBrand(User brand) {
        this.brand = brand;
    }



}
