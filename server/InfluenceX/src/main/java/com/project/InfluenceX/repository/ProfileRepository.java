package com.project.InfluenceX.repository;

import com.project.InfluenceX.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProfileRepository extends JpaRepository<User, Long> {

    Optional<User> findById(Long id);

    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    @Query("SELECT u FROM User u LEFT JOIN FETCH u.socialMediaProfiles WHERE u.id = :id")
    Optional<User> findByIdWithSocialProfiles(@Param("id") Long id);

    @Query("SELECT u FROM User u LEFT JOIN FETCH u.postsCreated WHERE u.id = :id")
    Optional<User> findByIdWithPosts(@Param("id") Long id);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);
}