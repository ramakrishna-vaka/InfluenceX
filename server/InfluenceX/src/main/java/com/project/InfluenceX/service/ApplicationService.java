package com.project.InfluenceX.service;

import com.project.InfluenceX.model.*;
import com.project.InfluenceX.repository.ApplicationRepository;
import com.project.InfluenceX.repository.PostsRepository;
import com.project.InfluenceX.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.ResponseStatus;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final PostsRepository postsRepository;
    private final UserRepository userRepository;
    private final NotificationsService notificationsService;
    private final ChatService chatService;

    public ApplicationService(ApplicationRepository applicationRepository, PostsRepository postsRepository,UserRepository userRepository,NotificationsService notificationsService,ChatService chatService){
        this.applicationRepository=applicationRepository;
        this.postsRepository = postsRepository;
        this.userRepository = userRepository;
        this.notificationsService=notificationsService;
        this.chatService=chatService;
    }

    //TODO: don't use repository of posts/user here. keep fetching logic only in their respective service
    public ResponseEntity<Application> createApplication(ApplicationDTO applicationDTO){
        Application application=new Application();
        Long postId=applicationDTO.getPostId();
        Posts post = postsRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        application.setPost(post);
        User createdBy=post.getCreatedBy();

        Long userId=applicationDTO.getInfluencerId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));


        notificationsService.createNotification(
                createdBy,
                user.getName() + " applied to your post titled \"" + post.getTitle() + "\""
        );

        chatService.createChat(createdBy,user,new Message(user,createdBy,applicationDTO.getPitchMessage()));

        application.setInfluencer(user);
        application.setAppliedAt(LocalDateTime.now());
        application.setPitchMessage(applicationDTO.getPitchMessage());
        application.setStatus(ApplicationStatusEnum.Pending);
        applicationRepository.save(application);
        PostsService.setApplications(post,application);
        return ResponseEntity.ok(application);
    }

}
