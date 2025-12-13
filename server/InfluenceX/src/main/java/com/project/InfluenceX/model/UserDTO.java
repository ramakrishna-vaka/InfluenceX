package com.project.InfluenceX.model;

public class UserDTO {
    private Long id;
    private String name;
    private String password;
    private String email;

    public UserDTO(){

    }
    public Long getId(){ return id; }
    public String getName(){ return name;}
    public String getPassword(){return password;}
    public String getEmail(){return email;}

    public void setName(String name){this.name=name; }
    public void setEmail(String email){this.email=email; }
    public void setId(Long id){ this.id=id; }
}
