package com.project.InfluenceX.model;

import java.time.LocalDateTime;

public class MessageDTO {
    private Long id;
    private UserDTO sender;
    private UserDTO receiver;
    private String content;
    private LocalDateTime timestamp;
    private Boolean isReadBy;

    // Constructors
    public MessageDTO() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public UserDTO getSender() { return sender; }
    public void setSender(UserDTO sender) { this.sender = sender; }

    public UserDTO getReceiver() { return receiver; }
    public void setReceiver(UserDTO receiver) { this.receiver = receiver; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public Boolean getIsReadBy() { return isReadBy; }
    public void setIsReadBy(Boolean isReadBy) { this.isReadBy = isReadBy; }
}
