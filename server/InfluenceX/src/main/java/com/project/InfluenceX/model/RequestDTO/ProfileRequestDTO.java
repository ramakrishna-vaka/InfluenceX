package com.project.InfluenceX.model.RequestDTO;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

public class ProfileRequestDTO {

    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    private String name;

    @Size(max = 500, message = "Bio cannot exceed 500 characters")
    private String bio;

    @Pattern(regexp = "^\\+?[1-9]\\d{1,14}$", message = "Invalid phone number format")
    private String phone;

    @Size(max = 200, message = "Location cannot exceed 200 characters")
    private String location;

    private List<String> preferredCategories;

    private List<String> languagesKnown;

    private MultipartFile avatar;

    private String website;

    private String address;

    // Constructors
    public ProfileRequestDTO() {}

    public ProfileRequestDTO(String name, String bio, String phone, String location) {
        this.name = name;
        this.bio = bio;
        this.phone = phone;
        this.location = location;
    }

    // Getters and Setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public List<String> getPreferredCategories() {
        return preferredCategories;
    }

    public void setPreferredCategories(List<String> preferredCategories) {
        this.preferredCategories = preferredCategories;
    }

    public List<String> getLanguagesKnown() {
        return languagesKnown;
    }

    public void setLanguagesKnown(List<String> languagesKnown) {
        this.languagesKnown = languagesKnown;
    }

    public MultipartFile getAvatar() {
        return avatar;
    }

    public void setAvatar(MultipartFile avatar) {
        this.avatar = avatar;
    }

    public String getWebsite() {
        return website;
    }

    public void setWebsite(String website) {
        this.website = website;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public void setLanguagesKnown(String languagesKnownJson) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            this.languagesKnown = mapper.readValue(languagesKnownJson,
                    new TypeReference<List<String>>() {});
        } catch (Exception e) {
            this.languagesKnown = new ArrayList<>();
        }
    }

    public void setPreferredCategories(String preferredCategoriesJson) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            this.preferredCategories = mapper.readValue(preferredCategoriesJson,
                    new TypeReference<List<String>>() {});
        } catch (Exception e) {
            this.preferredCategories = new ArrayList<>();
        }
    }



}
