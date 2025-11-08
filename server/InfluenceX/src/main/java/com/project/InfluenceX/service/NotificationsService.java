package com.project.InfluenceX.service;

import com.project.InfluenceX.model.Notifications;
import com.project.InfluenceX.model.User;
import com.project.InfluenceX.repository.NotificationsRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationsService {

    private final NotificationsRepository notificationsRepository;

    public NotificationsService(NotificationsRepository notificationsRepository) {
        this.notificationsRepository = notificationsRepository;
    }

    public void createNotification(User user, String message) {
        Notifications notification = new Notifications();
        notification.setUser(user);
        notification.setNotification(message);
        notification.setReadBy(false);
        //notification.setCreatedAt(LocalDateTime.now());
        notificationsRepository.save(notification);
    }

    public List<Notifications> getAllNotifications(User user) {
        return notificationsRepository.findByUser(user);
    }

    public ResponseEntity<List<Notifications>> readNotifications(){
        List<Notifications> notificationsListForUser = notificationsRepository.findAll();
        List<Notifications> markAllAsReadByUser= notificationsListForUser.stream()
                .peek(n -> n.setReadBy(true))
                .collect(Collectors.toList());
        notificationsRepository.saveAll(notificationsListForUser);
        return ResponseEntity.ok(markAllAsReadByUser);
    }
}
