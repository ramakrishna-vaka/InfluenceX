package com.project.InfluenceX.controller;


import com.project.InfluenceX.model.Notifications;
import com.project.InfluenceX.model.Posts;
import com.project.InfluenceX.model.User;
import com.project.InfluenceX.repository.UserRepository;
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
@CrossOrigin(origins = "http://localhost:5173",allowCredentials = "true")
public class NotificationsController {

    private final NotificationsService notificationsService;
    private final JwtService jwtService;
    private final UserRepository userRepository;

    public NotificationsController(NotificationsService notificationsService,JwtService jwtService,UserRepository userRepository){
        this.notificationsService=notificationsService;
        this.jwtService=jwtService;
        this.userRepository=userRepository;
    }

    public record NotificationDTO(Long id, String notification, boolean readBy) {}

    @GetMapping("/get/notifications")
    public ResponseEntity<?> getAllNotifications(HttpServletRequest request){
        // 1️⃣ Get cookies from request
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("No cookies found");
        }

        // 2️⃣ Find authToken cookie
        String token = null;
        for (Cookie cookie : cookies) {
            if ("authToken".equals(cookie.getName())) {
                token = cookie.getValue();
                break;
            }
        }

        String email = jwtService.extractEmail(token);
        User user=userRepository.findByEmail(email);

        if (token == null || !jwtService.validateToken(token,user)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or missing token");
        }


        // 4️⃣ Fetch user’s posts
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
