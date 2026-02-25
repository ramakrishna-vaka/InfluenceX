package com.project.InfluenceX.Utils;

import com.project.InfluenceX.model.PostRequestDTO;
import com.project.InfluenceX.model.PostResponseDTO;
import com.project.InfluenceX.model.PostStatusEnum;
import com.project.InfluenceX.model.Posts;
import org.springframework.http.ResponseEntity;

import java.util.Arrays;

public class ModelToDTOMapper {

    public static PostResponseDTO getPostResponseDTO(Posts post){
        return new PostResponseDTO();
    }

    public static Posts getPost(PostRequestDTO postRequestDTO){
        Posts post =new Posts();
        String postStatus = postRequestDTO.getPostStatus();
        PostStatusEnum postStatusEnum =  PostStatusEnum.valueOf(postStatus);
        post.setPostStatus(postStatusEnum);
        post.setTitle(postRequestDTO.getCampaignTitle());
        post.setDescription(postRequestDTO.getCampaignDescription());
        post.setDeadline(postRequestDTO.getDeadline());
        post.setLocation(postRequestDTO.getLocation());
        post.setPlatformsNeeded(Arrays.asList(postRequestDTO.getPlatforms()));
        post.setFollowers(postRequestDTO.getFollowers());
        post.setType(postRequestDTO.getType());
        //post.setOpenRoles(1);
        post.setCreatedAt(java.time.LocalDateTime.now());
        post.setUpdatedAt(java.time.LocalDateTime.now());
        post.setDeliverables(postRequestDTO.getDeliverables());
        post.setApplicationDeadline(postRequestDTO.getApplicationDeadline());
        post.setCompensationType(postRequestDTO.getCompensationType());
        post.setCompensationDescription(postRequestDTO.getCompensationDescription());
        post.setApplicants(0);
        try {
            if (postRequestDTO.getImage() != null && !postRequestDTO.getImage().isEmpty()) {
                byte[] imageBytes = postRequestDTO.getImage().getBytes();
                System.out.println("Image bytes length: " + (imageBytes != null ? imageBytes.length : 0));
                post.setImageData(imageBytes);
            } else {
                post.setImageData(null); // Explicitly set to null if no image
            }
        } catch (Exception e) {
            e.printStackTrace();
            System.out.println("Failed to read image");
            return null;// Add this for debugging
            //return ResponseEntity.status(500).body("Failed to read image: " + e.getMessage());
        }

        System.out.println("Saving post with imageData: " +
                (post.getImageData() != null ? post.getImageData().length + " bytes" : "null"));
        return new Posts();
    }
}
