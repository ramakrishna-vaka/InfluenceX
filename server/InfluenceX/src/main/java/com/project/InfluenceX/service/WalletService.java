package com.project.InfluenceX.service;

import com.project.InfluenceX.model.User;
import com.project.InfluenceX.model.WalletTransaction;
import com.project.InfluenceX.model.ResponseDTO.WalletResponseDTO;
import com.project.InfluenceX.repository.UserRepository;
import com.project.InfluenceX.repository.WalletTransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class WalletService {

    private static final double MIN_WITHDRAW = 500.0;

    private final UserRepository               userRepository;
    private final WalletTransactionRepository  txnRepository;

    public WalletService(UserRepository userRepository,
                         WalletTransactionRepository txnRepository) {
        this.userRepository = userRepository;
        this.txnRepository  = txnRepository;
    }

    // ── GET wallet ────────────────────────────────────────────────────────────

    public WalletResponseDTO getWallet(User user) {

        List<WalletResponseDTO.TransactionDTO> txns =
                txnRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                        .stream()
                        .map(t -> new WalletResponseDTO.TransactionDTO(
                                t.getId(),
                                t.getType().name(),
                                t.getAmount(),
                                t.getDescription(),
                                t.getReference(),
                                t.getCreatedAt()
                        ))
                        .collect(Collectors.toList());

        return new WalletResponseDTO(user.getWalletMoney(), txns);
    }

    // ── CREDIT (called internally — e.g. from PaymentService after capture) ──

    @Transactional
    public void credit(User user, double amount, String description, String reference) {
        user.setWalletMoney(user.getWalletMoney() + amount);
        userRepository.save(user);
        txnRepository.save(WalletTransaction.credit(user, amount, description, reference));
    }

    // ── WITHDRAW ──────────────────────────────────────────────────────────────

    @Transactional
    public void withdraw(User user, double amount, String accountNumber, String ifsc) {

        if (amount < MIN_WITHDRAW) {
            throw new IllegalArgumentException(
                    "Minimum withdrawal amount is ₹" + (int) MIN_WITHDRAW);
        }
        if (amount > user.getWalletMoney()) {
            throw new IllegalArgumentException("Insufficient wallet balance");
        }

        user.setWalletMoney(user.getWalletMoney() - amount);
        userRepository.save(user);

        // Mask the account number for the reference string (show only last 4 digits)
        String maskedAccount = "••••" + accountNumber.substring(Math.max(0, accountNumber.length() - 4));
        String reference = "Bank " + maskedAccount + " | IFSC: " + ifsc;

        txnRepository.save(WalletTransaction.debit(
                user,
                amount,
                "Withdrawal to bank account",
                reference
        ));

        // TODO: Trigger actual bank transfer via Razorpay Payout API or NEFT
        //       For now this is a manual / scheduled payout flow.
    }

    // ── Helper ────────────────────────────────────────────────────────────────

    private User findUser(String email) {
        User user = userRepository.findByEmail(email);
        if (user == null) throw new RuntimeException("User not found: " + email);
        return user;
    }
}