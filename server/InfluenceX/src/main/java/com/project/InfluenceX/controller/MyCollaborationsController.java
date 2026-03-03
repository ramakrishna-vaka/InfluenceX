package com.project.InfluenceX.controller;

import com.project.InfluenceX.model.User;
import com.project.InfluenceX.service.AuthService;
import com.project.InfluenceX.service.MyCollaborationsService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.http.HttpResponse;

import static org.springframework.messaging.simp.SimpMessageHeaderAccessor.getUser;

@RestController
@CrossOrigin(origins = "http://localhost:5173",allowCredentials = "true")
public class MyCollaborationsController {

    private final AuthService authService;
    private final MyCollaborationsService myCollaborationsService;

    public MyCollaborationsController(AuthService authService,MyCollaborationsService myCollaborationsService){
        this.authService=authService;
        this.myCollaborationsService=myCollaborationsService;
    }

    @GetMapping("my-collaborations")
    public ResponseEntity<?> getMyCollaborations(HttpServletRequest request){
        User user = authService.getUser(request);
        if(user==null){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }
        return myCollaborationsService.getMyCollaborations(user);
    }
}
