package com.project.InfluenceX.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "chat_messages")
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name="chat_id")
    private Chat chatId;

    @ManyToOne
    private User sender;

    @ManyToOne
    private User receiver;

    private String content;

    private LocalDateTime timestamp;

    private Boolean isReadBy;

    public Message() {
        this.timestamp = LocalDateTime.now();
        isReadBy=false;
    }


    public Message(User sender, User receiver, String content) {
        this.sender = sender;
        this.receiver = receiver;
        this.content = content;
        this.timestamp = LocalDateTime.now();
        this.isReadBy=false;
    }

    // Getters & Setters
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

    public boolean getIsReadBy() { return isReadBy; }
    public void setIsReadBy(boolean isReadBy){ this.isReadBy=isReadBy; }
}
