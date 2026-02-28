package com.project.InfluenceX.Utils;

import com.project.InfluenceX.model.*;
import org.springframework.http.ResponseEntity;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Base64;
import java.util.List;

public class ModelToDTOMapper {

    public static PostResponseDTO getPostResponseDTO(Posts post){
        return new PostResponseDTO();
    }

    public static Posts getPost(PostRequestDTO postRequestDTO){
        Posts post =new Posts();
        return updatePostWithPostDTO(post,postRequestDTO);
    }


    public static ApplicationDTO getApplicationDTO(Application application){
        ApplicationDTO applicationDTO=new ApplicationDTO();
        applicationDTO.setApplicationStatus(application.getStatus().toString());
        applicationDTO.setPostId(application.getPost().getId());
        applicationDTO.setInfluencerId(application.getInfluencer().getId());
        applicationDTO.setPitchMessage(application.getPitchMessage());
        applicationDTO.setAppliedAt(application.getAppliedAt());
        return applicationDTO;
    }

    public static Posts updatePostWithPostDTO(Posts post, PostRequestDTO postRequestDTO){
        if(post.getApplications()==null) post.addApplications(new Application());
        String postStatus = postRequestDTO.getPostStatus();
        PostStatusEnum postStatusEnum =  PostStatusEnum.valueOf(postStatus);
        post.setPostStatus(postStatusEnum);
        post.setTitle(postRequestDTO.getCampaignTitle());
        post.setDescription(postRequestDTO.getCampaignDescription());
        post.setDeadline(postRequestDTO.getDeadline());
        post.setLocation(postRequestDTO.getLocation());
        post.setPlatformsNeeded(
                new ArrayList<>(Arrays.asList(postRequestDTO.getPlatforms()))
        );
        post.setFollowers(postRequestDTO.getFollowers());
        post.setType(postRequestDTO.getType());
        //post.setOpenRoles(1);
        post.setCreatedAt(java.time.LocalDateTime.now());
        post.setUpdatedAt(java.time.LocalDateTime.now());
        post.setDeliverables(postRequestDTO.getDeliverables());
        post.setApplicationDeadline(postRequestDTO.getApplicationDeadline());
        post.setCompensationType(postRequestDTO.getCompensationType());
        post.setCompensationDescription(postRequestDTO.getCompensationDescription());
        post.setApplicants(post.getApplications().size());
        try {
            if (postRequestDTO.getImage() != null && !postRequestDTO.getImage().isEmpty()) {
                byte[] imageBytes = postRequestDTO.getImage().getBytes();
                System.out.println("Image bytes length: " + (imageBytes != null ? imageBytes.length : 0));
                post.setImageData(imageBytes);
            } else {
                if(post.getImageData()==null) post.setImageData(null); // Explicitly set to null if no image
            }
        } catch (Exception e) {
            e.printStackTrace();
            System.out.println("Failed to read image");
            return null;// Add this for debugging
            //return ResponseEntity.status(500).body("Failed to read image: " + e.getMessage());
        }

        System.out.println("Saving post with imageData: " +
                (post.getImageData() != null ? post.getImageData().length + " bytes" : "null"));
        return post;
    }

    public static PostResponseDTO getPostResponseDTO(Posts post,User loggedUser){
        PostResponseDTO dto = new PostResponseDTO();
        dto.setId(post.getId());
        User user=post.getCreatedBy();
        UserDTO createdBy=new UserDTO();
        createdBy.setName(user.getName());
        createdBy.setEmail(user.getEmail());
        createdBy.setId(user.getId());
        dto.setCreatedBy(createdBy);
        //dto.setBudget(post.getBudget());
        dto.setDeadline(post.getDeadline());
        dto.setLocation(post.getLocation());
        dto.setType(post.getType());
        dto.setTitle(post.getTitle());
        dto.setDescription(post.getDescription());
        dto.setApplicants(post.getApplicants());
        dto.setOpenRoles(post.getOpenRoles());
        dto.setFollowers(post.getFollowers());
        dto.setPostStatus(post.getPostStatus().name());
        dto.setDeliverables(post.getDeliverables());
        if(post.getUpdatedAt()!=null) dto.setUpdatedAt(post.getUpdatedAt().toString());
        if(post.getCreatedAt()!=null) dto.setCreatedAt(post.getCreatedAt().toString());
        dto.setCompensationType(post.getCompensationType());
        dto.setCompensationDescription(post.getCompensationDescription());
        dto.setPlatformsNeeded(post.getPlatformsNeeded().toArray(new String[0]));
        if(loggedUser==null){
            dto.setCreatedByMe(false);
        }else if(loggedUser.getId()== user.getId()) {
            dto.setCreatedByMe(true);
        }else{
            dto.setCreatedByMe(false);
        }

        // Convert image to Base64
        if (post.getImageData() != null) {
            dto.setImageBase64(Base64.getEncoder().encodeToString(post.getImageData()));
        }

        // Convert applications
        List<ApplicationDTO> apps = post.getApplications()
                .stream()
                .map(app -> {
                    ApplicationDTO a = new ApplicationDTO();
                    a.setPostId(app.getId());
                    a.setInfluencerId(app.getInfluencer().getId());
                    a.setPitchMessage(app.getPitchMessage());
                    return a;
                })
                .toList();

        dto.setApplications(apps);

        return dto;
    }
}
