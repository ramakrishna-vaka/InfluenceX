package com.project.InfluenceX.repository;

import com.project.InfluenceX.model.SocialMediaProfile;
import com.project.InfluenceX.model.SocialPlatform;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SocialMediaProfileRepository
        extends JpaRepository<SocialMediaProfile, Long> {

    Optional<SocialMediaProfile>
    findByPlatformAndPlatformUserId(
            SocialPlatform platform,
            String platformUserId
    );
}

