package com.project.InfluenceX.controller;


import com.project.InfluenceX.model.Notifications;
import com.project.InfluenceX.model.Posts;
import com.project.InfluenceX.model.User;
import com.project.InfluenceX.repository.UserRepository;
import com.project.InfluenceX.service.AuthService;
import com.project.InfluenceX.service.JwtService;
import com.project.InfluenceX.service.NotificationsService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@CrossOrigin(origins = "https://www.influencex.online/",allowCredentials = "true")
public class NotificationsController {

    private final NotificationsService notificationsService;
    private final AuthService authService;

    public NotificationsController(NotificationsService notificationsService,AuthService authService){
        this.notificationsService=notificationsService;
        this.authService=authService;
    }

    public record NotificationDTO(Long id, String notification, boolean readBy) {}

    @GetMapping("/get/notifications")
    public ResponseEntity<?> getAllNotifications(HttpServletRequest request){

        User user = authService.getUser(request);

        //  Fetch user’s posts
        List<Notifications> notifications = notificationsService.getAllNotifications(user);
        List<NotificationDTO> response = notifications.stream()
                .map(n -> new NotificationDTO(n.getId(), n.getNotification(), n.getReadBy()))
                .toList();
        return ResponseEntity.ok(response);
    }

    @PostMapping("/post/notification")
    public ResponseEntity readNotification(){
        return notificationsService.readNotifications();
    }

}
