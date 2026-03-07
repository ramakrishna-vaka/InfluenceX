package com.project.InfluenceX.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Deliverable — child entity of Application
 *
 * Add to Application.java:
 *
 *   @OneToMany(mappedBy = "application", cascade = CascadeType.ALL, orphanRemoval = true)
 *   private List<Deliverable> deliverables = new ArrayList<>();
 *
 * Also add to Application.java:
 *   private String razorpayOrderId;
 *   private String razorpayPaymentId;
 *   private LocalDateTime paidAt;
 */
@Entity
@Table(name = "deliverables")
public class Deliverable {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String type;          // "Instagram Reel", "YouTube Video", etc.

    @Column(nullable = false, length = 1000)
    private String url;           // content link

    @Column(length = 1000)
    private String imageUrl;      // optional preview image

    @Column(nullable = false)
    private LocalDateTime uploadedAt;

    @JsonBackReference
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false)
    private Application application;


    // ── Getters / Setters ────────────────────────────────────────────────────

    public String getId()                     { return id; }
    public String getType()                   { return type; }
    public void   setType(String type)        { this.type = type; }
    public String getUrl()                    { return url; }
    public void   setUrl(String url)          { this.url = url; }
    public String getImageUrl()               { return imageUrl; }
    public void   setImageUrl(String u)       { this.imageUrl = u; }
    public LocalDateTime getUploadedAt()      { return uploadedAt; }
    public void setUploadedAt(LocalDateTime t){ this.uploadedAt = t; }
    public Application getApplication()       { return application; }
    public void setApplication(Application a) { this.application = a; }
}