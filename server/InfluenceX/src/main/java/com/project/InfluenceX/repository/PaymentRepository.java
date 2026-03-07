package com.project.InfluenceX.repository;

import com.project.InfluenceX.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, String> {

    /** Look up by Razorpay order ID — used in webhook to find the right Payment */
    Optional<Payment> findByRazorpayOrderId(String razorpayOrderId);

    /** Check if a payment already exists for this application */
    Optional<Payment> findByApplication_Id(Long applicationId);
}