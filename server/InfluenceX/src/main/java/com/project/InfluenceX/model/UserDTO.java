package com.project.InfluenceX.model;

public class UserDTO {
    private Long id;
    private String name;
    private String password;
    private String email;
    private String image;

    public UserDTO(){

    }
    public Long getId(){ return id; }
    public String getName(){ return name;}
    public String getPassword(){return password;}
    public String getEmail(){return email;}
    public String getImage(){ return image; }

    public void setName(String name){this.name=name; }
    public void setEmail(String email){this.email=email; }
    public void setId(Long id){ this.id=id; }
    public void setImage(String image){
        this.image=image;
    }
}
