package com.project.InfluenceX.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * WalletTransaction — one row per credit or debit on a user's wallet.
 *
 * 'reference' stores context about where the money came from or went to.
 * Examples:
 *   CREDIT — "Payment received for campaign: Summer Glow | Campaign #42"
 *   DEBIT  — "Withdrawal to bank account ending 4321 | IFSC: SBIN0001234"
 */
@Entity
@Table(name = "wallet_transactions", indexes = {
        @Index(name = "idx_wt_user_id",    columnList = "user_id"),
        @Index(name = "idx_wt_created_at", columnList = "created_at")
})
public class WalletTransaction {

    public enum Type { CREDIT, DEBIT }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Type type;                      // CREDIT | DEBIT

    @Column(nullable = false)
    private double amount;                  // always positive, in INR

    @Column(nullable = false, length = 500)
    private String description;             // human-readable reason

    /**
     * For CREDIT: the payer reference (e.g. "Campaign #42 - Brand: Nike")
     * For DEBIT:  the bank details string (e.g. "Bank ••4321 | SBIN0001234")
     */
    @Column(length = 500)
    private String reference;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    // ── Constructors ──────────────────────────────────────────────────────────

    public WalletTransaction() {}

    public static WalletTransaction credit(User user, double amount, String description, String reference) {
        WalletTransaction t = new WalletTransaction();
        t.user        = user;
        t.type        = Type.CREDIT;
        t.amount      = amount;
        t.description = description;
        t.reference   = reference;
        t.createdAt   = LocalDateTime.now();
        return t;
    }

    public static WalletTransaction debit(User user, double amount, String description, String reference) {
        WalletTransaction t = new WalletTransaction();
        t.user        = user;
        t.type        = Type.DEBIT;
        t.amount      = amount;
        t.description = description;
        t.reference   = reference;
        t.createdAt   = LocalDateTime.now();
        return t;
    }

    // ── Getters ───────────────────────────────────────────────────────────────

    public Long getId()                { return id; }
    public User getUser()              { return user; }
    public Type getType()              { return type; }
    public double getAmount()          { return amount; }
    public String getDescription()     { return description; }
    public String getReference()       { return reference; }
    public LocalDateTime getCreatedAt(){ return createdAt; }

    // ── Setters (needed by JPA) ───────────────────────────────────────────────

    public void setId(Long id)                     { this.id = id; }
    public void setUser(User user)                 { this.user = user; }
    public void setType(Type type)                 { this.type = type; }
    public void setAmount(double amount)           { this.amount = amount; }
    public void setDescription(String description) { this.description = description; }
    public void setReference(String reference)     { this.reference = reference; }
    public void setCreatedAt(LocalDateTime t)      { this.createdAt = t; }
}