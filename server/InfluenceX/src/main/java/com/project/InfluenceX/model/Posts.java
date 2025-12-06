package com.project.InfluenceX.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Entity
@Table(name = "posts")  // Add this too
public class Posts {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(insertable = false)
    private Long id;

    @Column(name = "title")
    private String title;

    @Column(name = "description")
    private String description;

    @Enumerated
    @Column(name = "post_status")
    private PostStatusEnum postStatus;

    @ManyToOne
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @Column(name = "open_roles")
    private int openRoles;

    @Column(name = "applicants")
    private int applicants = 0;

    @Column(name = "budget")
    private int budget;

    @Column(name = "deadline")
    private String deadline;

    @Column(name = "location")
    private String location;

    @Column(name = "type")
    private String type;

    @ElementCollection
    @CollectionTable(name = "post_platforms", joinColumns = @JoinColumn(name = "post_id"))
    @Column(name = "platform")
    private List<String> platformsNeeded;

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties({"post"})
    private List<Application> applications = new ArrayList<>();

    @Column(name = "created_at")
    private final java.time.LocalDateTime createdAt = java.time.LocalDateTime.now();

    // Remove @Lob and change the mapping to use @Basic with length
    @Basic(fetch = FetchType.LAZY)
    @Column(name = "image_data", length = 10485760) // 10MB limit
    private byte[] imageData;

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

    public byte[] getImageData(){
        return imageData;
    }


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

    public void setImageData(byte[] imageData){
        this.imageData=imageData;
    }

}
