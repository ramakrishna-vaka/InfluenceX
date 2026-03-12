package com.project.InfluenceX.repository;

import com.project.InfluenceX.model.WalletTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WalletTransactionRepository extends JpaRepository<WalletTransaction, Long> {

    /** All transactions for a user, newest first */
    List<WalletTransaction> findByUserIdOrderByCreatedAtDesc(Long userId);

    /** Only credits (money in) */
    List<WalletTransaction> findByUserIdAndTypeOrderByCreatedAtDesc(
            Long userId, WalletTransaction.Type type);
}