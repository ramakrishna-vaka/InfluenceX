package com.project.InfluenceX.controller;

import com.project.InfluenceX.Utils.ModelToDTOMapper;
import com.project.InfluenceX.model.Application;
import com.project.InfluenceX.model.ApplicationDTO;
import com.project.InfluenceX.model.Posts;
import com.project.InfluenceX.model.User;
import com.project.InfluenceX.service.ApplicationService;
import com.project.InfluenceX.service.AuthService;
import com.project.InfluenceX.service.PostsService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static com.project.InfluenceX.Utils.ModelToDTOMapper.getApplicationDTO;

@RestController
@CrossOrigin(origins = "http://localhost:5173",allowCredentials = "true")
public class ApplicationController {

    private final ApplicationService applicationService;
    private final AuthService authService;
    private final PostsService postsService;

    public ApplicationController(ApplicationService applicationService, AuthService authService,PostsService postsService){
        this.authService=authService;
        this.applicationService=applicationService;
        this.postsService=postsService;
    }

    @PostMapping("/application/create")
    public ResponseEntity<?> createApplication(@RequestBody ApplicationDTO applicationDTO){
        return applicationService.createApplication(applicationDTO);
    }

    @GetMapping("applications/{postId}")
    public ResponseEntity<?> getApplicationsForAPost(
            HttpServletRequest request,
            @PathVariable Long postId) {

        User user = authService.getUser(request);

        if (user == null) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Please authenticate yourself");
        }

        Posts post = postsService.getPostById(postId);

        if (post == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Post not found");
        }

        List<ApplicationDTO> applicationDTOs = post.getApplications()
                .stream()
                .map(ModelToDTOMapper::getApplicationDTO)
                .toList();

        return ResponseEntity.ok(applicationDTOs);
    }

}