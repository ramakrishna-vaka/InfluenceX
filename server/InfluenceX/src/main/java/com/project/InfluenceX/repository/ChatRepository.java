package com.project.InfluenceX.repository;

import com.project.InfluenceX.model.Chat;
import com.project.InfluenceX.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatRepository extends JpaRepository<Chat, Long> {
    List<Chat> findByBrand(User brand);
    List<Chat> findByInfluencer(User influencer);
    Chat findByInfluencerAndBrand(User influencer,User brand );
}
