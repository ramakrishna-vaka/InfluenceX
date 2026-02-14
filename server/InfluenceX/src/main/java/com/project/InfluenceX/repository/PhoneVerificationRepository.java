package com.project.InfluenceX.repository;

import com.project.InfluenceX.model.PhoneVerification;
import com.project.InfluenceX.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PhoneVerificationRepository extends JpaRepository<PhoneVerification, Long> {

    Optional<PhoneVerification> findById(Long id);

    Optional<PhoneVerification> findTopByUser_IdAndPhoneNumberOrderByExpiresAtDesc(Long userId, String phoneNumber);

}