package com.project.InfluenceX.repository;

import com.project.InfluenceX.model.Posts;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface PostsRepository extends JpaRepository<Posts, Long> {

    @Modifying
    @Transactional
    @Query("""
        UPDATE Posts p
        SET p.postStatus = com.project.InfluenceX.model.PostStatusEnum.NO_LONGER_ACCEPTING_APPLICATIONS
        WHERE p.applicationDeadline < CURRENT_TIMESTAMP
        AND p.postStatus = com.project.InfluenceX.model.PostStatusEnum.OPEN
    """)
    int expirePosts();
}
