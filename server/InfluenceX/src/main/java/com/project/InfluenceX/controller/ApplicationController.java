package com.project.InfluenceX.controller;

import com.project.InfluenceX.Utils.ModelToDTOMapper;
import com.project.InfluenceX.model.Application;
import com.project.InfluenceX.model.ApplicationDTO;
import com.project.InfluenceX.model.Posts;
import com.project.InfluenceX.model.RequestDTO.DeliverablesDTO;
import com.project.InfluenceX.model.User;
import com.project.InfluenceX.service.ApplicationService;
import com.project.InfluenceX.service.AuthService;
import com.project.InfluenceX.service.PostsService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

import static com.project.InfluenceX.Utils.ModelToDTOMapper.getApplicationDTO;

@RestController
@CrossOrigin(origins = "https://www.influencex.online/",allowCredentials = "true")
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

    @PostMapping("application/{applicationId}/accept")
    public ResponseEntity<?> acceptApplication(HttpServletRequest request,@PathVariable Long applicationId){
        User user = authService.getUser(request);
        if(user == null){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Please Authenticate");
        }
        Application application = applicationService.getApplicationById(applicationId);
        if(!application.getPost().getCreatedBy().equals(user)){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorised user");
        }
        return applicationService.acceptApplication(application);
    }

    @PostMapping("application/{applicationId}/reject")
    public ResponseEntity<?> rejectApplication(HttpServletRequest request,@PathVariable Long applicationId){
        User user = authService.getUser(request);
        if(user == null){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Please Authenticate");
        }
        Application application = applicationService.getApplicationById(applicationId);
        if(!application.getPost().getCreatedBy().equals(user)){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorised user");
        }
        return applicationService.rejectApplication(application);
    }

    @PostMapping("application/{applicationId}/withdraw")
    public ResponseEntity<?> withdrawApplication(HttpServletRequest request,@PathVariable Long applicationId){
        User user = authService.getUser(request);
        if(user == null){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Please Authenticate");
        }
        Application application = applicationService.getApplicationById(applicationId);
        if(!application.getInfluencer().equals(user)){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorised user");
        }
        return applicationService.withdrawApplication(application);
    }

    @PostMapping("application/{applicationId}/upload-deliverables")
    public ResponseEntity<?> uploadDeliverables(HttpServletRequest request, @PathVariable Long applicationId, @RequestBody List<DeliverablesDTO> deliverablesDTOS){
        User user = authService.getUser(request);
        if(user == null){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Please Authenticate");
        }
        Application application = applicationService.getApplicationById(applicationId);
        if(!application.getInfluencer().equals(user)){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorised user");
        }
        return applicationService.submitDeliverables(application,deliverablesDTOS);
    }

    @PostMapping("application/{applicationId}/accept-deliverables")
    public ResponseEntity<?> acceptDeliverables(HttpServletRequest request, @PathVariable Long applicationId){
        User user=authService.getUser(request);
        if(user==null){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Please Authenticate");
        }
        Application application = applicationService.getApplicationById(applicationId);
        if(!application.getPost().getCreatedBy().equals(user)){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorised user");
        }
        Map<String, Object> response =
                applicationService.acceptDeliverablesAndCreateOrder(application);

        return ResponseEntity.ok(response);
    }

    @PostMapping("application/{applicationId}/reject-deliverables")
    public ResponseEntity<?> rejectDeliverables(HttpServletRequest request, @PathVariable Long applicationId){
        User user=authService.getUser(request);
        if(user==null){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Please Authenticate");
        }
        Application application = applicationService.getApplicationById(applicationId);
        if(!application.getPost().getCreatedBy().equals(user)){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorised user");
        }
        return applicationService.rejectDeliverables(application);
    }


}