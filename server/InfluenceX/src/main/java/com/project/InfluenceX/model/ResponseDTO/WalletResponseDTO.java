package com.project.InfluenceX.model.ResponseDTO;

import java.time.LocalDateTime;
import java.util.List;

/** Returned by GET /wallet */
public class WalletResponseDTO {

    private double balance;
    private List<TransactionDTO> transactions;

    public WalletResponseDTO(double balance, List<TransactionDTO> transactions) {
        this.balance      = balance;
        this.transactions = transactions;
    }

    public double getBalance()                      { return balance; }
    public List<TransactionDTO> getTransactions()   { return transactions; }

    // ── Nested DTO ────────────────────────────────────────────────────────────

    public static class TransactionDTO {
        private Long id;
        private String type;          // "CREDIT" | "DEBIT"
        private double amount;
        private String description;
        private String reference;
        private LocalDateTime createdAt;

        public TransactionDTO(Long id, String type, double amount,
                              String description, String reference, LocalDateTime createdAt) {
            this.id          = id;
            this.type        = type;
            this.amount      = amount;
            this.description = description;
            this.reference   = reference;
            this.createdAt   = createdAt;
        }

        public Long getId()              { return id; }
        public String getType()          { return type; }
        public double getAmount()        { return amount; }
        public String getDescription()   { return description; }
        public String getReference()     { return reference; }
        public LocalDateTime getCreatedAt() { return createdAt; }
    }
}