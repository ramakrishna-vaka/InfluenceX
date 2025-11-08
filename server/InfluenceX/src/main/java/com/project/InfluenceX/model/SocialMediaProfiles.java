package com.project.InfluenceX.model;

import jakarta.persistence.*;

@Entity
public class SocialMediaProfiles {

    @Id
    @GeneratedValue
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String handle;

    private String user_name;

    private long followers;

    private double engagementRate;



}
