package com.project.InfluenceX.model;

import jakarta.persistence.*;
import org.hibernate.annotations.Cascade;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue
    private Long id;

    @Column
    private String name;

    @Column(nullable = false,unique = true)
    private String email;

    @Column
    private String passwordHash;

    @Column
    private String profilePic;

    @Column(length=500)
    private String bio;

    @Enumerated
    private UserEnum role;

    //mapped by should match the field name of the joined entity
    @OneToMany(mappedBy ="user" ,cascade = CascadeType.ALL  )
    private List<SocialMediaProfiles> socialMediaProfiles;

    @OneToMany(mappedBy = "createdBy", cascade=CascadeType.ALL)
    private List<Posts> postsCreated;

//    @ManyToMany(mappedBy = "influencers")
//    private List<Posts> influencedPosts;

    @Column
    private double averageRating;

    @Column
    private int ratingCount;




    public User() { }

    public User(String email,String password) {
        this.email = email;
        this.passwordHash=password;
    }

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword(){ return passwordHash; }

    public void setPassword(String password){
        this.passwordHash=password;
    }
}
