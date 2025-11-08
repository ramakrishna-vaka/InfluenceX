package com.project.InfluenceX.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Entity
public class Posts {

    @Id
    @GeneratedValue
    private Long id;

    //@NotNull
    private String title;

    private String description;

    @Enumerated
    private PostStatusEnum postStatus;

    @ManyToOne
    @JoinColumn(name="created_by", nullable = false)
    private User createdBy;

    private int openRoles;

    private int applicants;

    private int budget;

    private String deadline;

    private String location;

    private String type;

    @ElementCollection
    private List<String> platformsNeeded;

    // All applications for this post (pending, accepted, rejected)
    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Application> applications = new ArrayList<>();

    @Column(name = "created_at")
    private java.time.LocalDateTime createdAt = java.time.LocalDateTime.now();

    public Posts() {}

    // ---------- GETTERS ----------
    public Long getId() { return id; }

    public String getTitle() { return title; }

    public String getDescription() { return description; }

    public PostStatusEnum getPostStatus() { return postStatus; }

    public User getCreatedBy() { return createdBy; }

    public int getOpenRoles() { return openRoles; }

    public int getApplicants() { return applicants; }

    public int getBudget() { return budget; }

    public String getDeadline() { return deadline; }

    public String getLocation() { return location; }

    public String getType() { return type; }

    public List<String> getPlatformsNeeded() { return platformsNeeded; }

    public List<Application> getApplications(){ return applications;}


    // ---------- SETTERS ----------
    public void setPostStatus(PostStatusEnum postStatus) {
        this.postStatus = postStatus;
    }

    public void setCreatedBy(User user) {
        this.createdBy = user;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setOpenRoles(int openRoles) {
        this.openRoles = openRoles;
    }

    public void setDeadline(String date) {
        this.deadline = date;
    }

    public void setType(String type) {
        this.type = type;
    }

    public void setPlatformsNeeded(List<String> platforms) {
        this.platformsNeeded = platforms;
    }

    public void setBudget(int budget) {
        this.budget = budget;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public void setApplicants(int applicants) {
        this.applicants = applicants;
    }

    public void setApplications(Application application) {
        List<Application> applications = getApplications();
        applications.add(application);
        this.applications = applications;
    }

}
