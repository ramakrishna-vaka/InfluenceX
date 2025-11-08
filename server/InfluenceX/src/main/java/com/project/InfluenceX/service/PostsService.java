package com.project.InfluenceX.service;

import com.project.InfluenceX.model.*;
import com.project.InfluenceX.repository.PostsRepository;
import com.project.InfluenceX.repository.UserRepository;
import org.hibernate.annotations.NotFound;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.Date;
import java.util.List;

@Service
public class PostsService {
    public PostsRepository postsRepository;
    public UserRepository userRepository;

    public PostsService(PostsRepository postsRepository, UserRepository userRepository) {
        this.postsRepository = postsRepository;
        this.userRepository = userRepository;
    }

    public List<Posts> getPosts()
    {
        return postsRepository.findAll();
    }

    public Posts getPostById(Long postId) {
        return postsRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + postId));
    }


    public ResponseEntity createPost(PostsDTO postsDTO)
    {
        Posts post=new Posts();
        post.setPostStatus(PostStatusEnum.Open);
        User user = userRepository.findById(String.valueOf(postsDTO.getUserId()))
                .orElse(null);
        if(user==null){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }
        post.setCreatedBy(user);
        post.setTitle(postsDTO.getCampaignTitle());
        post.setDescription(postsDTO.getCampaignDescription());
        post.setBudget(Integer.parseInt(postsDTO.getBudget()));
        post.setDeadline(postsDTO.getDeadline());
        post.setLocation(postsDTO.getLocation());
        post.setPlatformsNeeded(Arrays.asList(postsDTO.getPlatforms()));
        post.setType(postsDTO.getType());
        postsRepository.save(post);
        return ResponseEntity.ok(post);
    }

    public List<Posts> getMyPosts(User user){
        if(user==null){
            return null;
        }
        List<Posts> posts=postsRepository.findAll();
        return posts.stream().filter(post->post.getCreatedBy()==user).toList();
    }

    public static void setApplications(Posts post,Application application){
        post.setApplications(application);
    }

}
