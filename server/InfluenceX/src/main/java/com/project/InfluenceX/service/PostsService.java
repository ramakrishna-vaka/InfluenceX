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

import static com.project.InfluenceX.Utils.ModelToDTOMapper.*;

@Service
public class PostsService {
    public PostsRepository postsRepository;
    public UserRepository userRepository;

    public PostsService(PostsRepository postsRepository, UserRepository userRepository) {
        this.postsRepository = postsRepository;
        this.userRepository = userRepository;
    }

    public List<PostResponseDTO> getPostsResponse(User loggedUser) {
        List<Posts> posts = getPosts();
        return posts.stream().map(post -> getPostResponseDTO(post,loggedUser)).collect(Collectors.toList());
    }

    public List<Posts> getPosts(){
        return postsRepository.findAll();
    }


    public Posts getPostById(Long postId) {
        return postsRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + postId));
    }

    public PostResponseDTO getPostResponseById(Long postId){
        return getPostResponseDTO(getPostById(postId),null);
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

        return posts.stream()
                .filter(post -> post.getCreatedBy().equals(user))
                .map(post -> getPostResponseDTO(post, user))
                .collect(Collectors.toList());
    }

    public static void setApplications(Posts post,Application application){
        post.addApplications(application);
    }

    public ResponseEntity updatePost(PostRequestDTO postsDTO, Posts post) {

        User user = userRepository.findById(postsDTO.getUserId()).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }

        Posts savedPost = postsRepository.save(Objects.requireNonNull(updatePostWithPostDTO(post, postsDTO)));
        return ResponseEntity.ok(savedPost);
    }

    public ResponseEntity<?> deletePost(Posts post) {
        boolean hasActiveApplication = post.getApplications().stream()
                .anyMatch(application ->
                        application.getCurrentStatus() != ApplicationStatusEnum.PENDING &&
                                application.getCurrentStatus() != ApplicationStatusEnum.REJECTED &&
                                application.getCurrentStatus() != ApplicationStatusEnum.WITHDRAW
                );

        if (hasActiveApplication) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Some Influencer is actively working on this post, so you cannot delete this");
        }

        postsRepository.delete(post);
        return ResponseEntity.ok("Post deleted successfully");
    }

}
