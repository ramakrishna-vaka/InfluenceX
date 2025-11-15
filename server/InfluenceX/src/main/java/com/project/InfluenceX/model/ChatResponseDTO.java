package com.project.InfluenceX.model;

import java.time.LocalDateTime;
import java.util.List;

public class ChatResponseDTO {
    private Long id;
    private User brand;
    private User influencer;
    private String status;
    private LocalDateTime createdAt;
    private List<MessageDTO> messageList;
    private int unReadMsgsCount;
    private String lastMessage;
    private LocalDateTime lastMsgTime;

    // Constructors
    public ChatResponseDTO() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getBrand() { return brand; }
    public void setBrand(User brand) { this.brand = brand; }

    public User getInfluencer() { return influencer; }
    public void setInfluencer(User influencer) { this.influencer = influencer; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public List<MessageDTO> getMessageList() { return messageList; }
    public void setMessageList(List<MessageDTO> messageList) { this.messageList = messageList; }

    public int getUnReadMsgsCount() { return unReadMsgsCount; }
    public void setUnReadMsgsCount(int unReadMsgsCount) { this.unReadMsgsCount = unReadMsgsCount; }

    public String getLastMessage() { return lastMessage; }
    public void setLastMessage(String lastMessage) { this.lastMessage = lastMessage; }

    public LocalDateTime getLastMsgTime() { return lastMsgTime; }
    public void setLastMsgTime(LocalDateTime lastMsgTime) { this.lastMsgTime = lastMsgTime; }

}