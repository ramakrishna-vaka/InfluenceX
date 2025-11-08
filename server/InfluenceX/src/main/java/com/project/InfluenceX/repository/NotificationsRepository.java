package com.project.InfluenceX.repository;

import com.project.InfluenceX.model.Notifications;
import com.project.InfluenceX.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationsRepository extends JpaRepository<Notifications,Long> {

    List<Notifications> findByUser(User user);

}
