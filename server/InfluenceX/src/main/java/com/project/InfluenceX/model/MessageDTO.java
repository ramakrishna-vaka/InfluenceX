package com.project.InfluenceX.model;

import java.time.LocalDateTime;

public class MessageDTO {
    private Long id;
    private User sender;
    private User receiver;
    private String content;
    private LocalDateTime timestamp;
    private Boolean isReadBy;

    // Constructors
    public MessageDTO() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getSender() { return sender; }
    public void setSender(User sender) { this.sender = sender; }

    public User getReceiver() { return receiver; }
    public void setReceiver(User receiver) { this.receiver = receiver; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public Boolean getIsReadBy() { return isReadBy; }
    public void setIsReadBy(Boolean isReadBy) { this.isReadBy = isReadBy; }
}
