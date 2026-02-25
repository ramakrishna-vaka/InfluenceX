package com.project.InfluenceX.service;

import com.project.InfluenceX.model.*;
import com.project.InfluenceX.repository.PostsRepository;
import com.project.InfluenceX.repository.UserRepository;
import org.hibernate.annotations.NotFound;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

import static com.project.InfluenceX.Utils.ModelToDTOMapper.getPost;

@Service
public class PostsService {
    public PostsRepository postsRepository;
    public UserRepository userRepository;

    public PostsService(PostsRepository postsRepository, UserRepository userRepository) {
        this.postsRepository = postsRepository;
        this.userRepository = userRepository;
    }

    public List<PostResponseDTO> getPosts(User loggedUser) {
        List<Posts> posts = postsRepository.findAll();

        return posts.stream().map(post -> {
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
        }).collect(Collectors.toList());
    }


    public Posts getPostById(Long postId) {
        return postsRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + postId));
    }


    public ResponseEntity createPost(PostRequestDTO postsDTO)
    {
        User user = userRepository.findById(postsDTO.getUserId())
                .orElse(null);
        if(user==null){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }
        Posts post=getPost(postsDTO);
        assert post != null;
        post.setCreatedBy(user);
        Posts savedPost = postsRepository.save(post);
        return ResponseEntity.ok(savedPost);
    }

    public List<PostResponseDTO> getMyPosts(User user){
        if(user==null){
            return null;
        }
        List<Posts> posts=postsRepository.findAll();

        return posts.stream().filter(post->post.getCreatedBy()==user).map(post -> {
            PostResponseDTO dto = new PostResponseDTO();
            dto.setId(post.getId());
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
            dto.setTitle(post.getTitle());
            dto.setDescription(post.getDescription());
            dto.setApplicants(post.getApplications().size());
            dto.setOpenRoles(post.getOpenRoles());
            dto.setFollowers(post.getFollowers());
            dto.setPostStatus(post.getPostStatus().name());
            dto.setPlatformsNeeded(post.getPlatformsNeeded().toArray(new String[0]));
           dto.setCreatedByMe(true);

            // Convert image to Base64
            if (post.getImageData() != null) {
                dto.setImageBase64(Base64.getEncoder().encodeToString(post.getImageData()));
            }

            // Convert applications
            List<ApplicationDTO> apps = post.getApplications()
                    .stream()
                    .map(app -> {
                        ApplicationDTO a = new ApplicationDTO();
                        a.setPostId(app.getPost().getId());
                        a.setInfluencerId(app.getInfluencer().getId());
                        a.setPitchMessage(app.getPitchMessage());
                        a.setAppliedAt(app.getAppliedAt());
                        return a;
                    })
                    .toList();

            dto.setApplications(apps);

            return dto;
        }).collect(Collectors.toList());
    }

    public static void setApplications(Posts post,Application application){
        post.setApplications(application);
    }

    public ResponseEntity updatePost(PostRequestDTO postsDTO, Posts post) {

        User user = userRepository.findById(postsDTO.getUserId()).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }

        // Normal fields update
        post.setTitle(postsDTO.getCampaignTitle());
        post.setDescription(postsDTO.getCampaignDescription());
        //post.setBudget(postsDTO.getBudget());
        post.setDeadline(postsDTO.getDeadline());
        post.setLocation(postsDTO.getLocation());
        post.setPlatformsNeeded(new ArrayList<>(Arrays.asList(postsDTO.getPlatforms())));
        post.setFollowers(postsDTO.getFollowers());
        post.setType(postsDTO.getType());
        post.setOpenRoles(1);

        // Image update
        try {
            if (postsDTO.getImage() != null && !postsDTO.getImage().isEmpty()) {

                // ⬇ NEW IMAGE UPLOADED → UPDATE IT
                byte[] imageBytes = postsDTO.getImage().getBytes();
                post.setImageData(imageBytes);

            } else {
                // ⬇ NO NEW IMAGE → KEEP EXISTING
                // DO NOTHING (do NOT set null)
            }

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Failed to process image");
        }

        Posts savedPost = postsRepository.save(post);
        return ResponseEntity.ok(savedPost);
    }


}
