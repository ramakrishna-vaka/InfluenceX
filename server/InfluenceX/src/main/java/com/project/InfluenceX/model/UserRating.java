package com.project.InfluenceX.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;

import java.time.LocalDateTime;

@Entity
public class UserRating {

    @Id
    @GeneratedValue
    private Long id;

    @ManyToOne
    private User ratedUser; // influencer being rated

    @ManyToOne
    private User ratedBy; // user who gave rating

    private int rating; // 1 to 5

    private String review;

    private LocalDateTime createdAt;
}
