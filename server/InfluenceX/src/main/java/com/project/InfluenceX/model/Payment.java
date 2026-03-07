package com.project.InfluenceX.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Payment — one-to-one with Application.
 *
 * Tracks the full Razorpay payment lifecycle for a collaboration.
 * A new Payment record is created when the brand accepts deliverables.
 * Status transitions: INITIATED → CAPTURED | FAILED → (retry) → CAPTURED
 */
@Entity
@Table(name = "payments")
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    // ── Relationship ─────────────────────────────────────────────────────────

    /** The collaboration this payment belongs to. One payment per application. */
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false, unique = true)
    private Application application;

    // ── Razorpay identifiers ─────────────────────────────────────────────────

    /** Razorpay Order ID (rzp_order_xxx) — created when brand accepts deliverables */
    @Column(name = "razorpay_order_id", unique = true)
    private String razorpayOrderId;

    /** Razorpay Payment ID (pay_xxx) — set after capture */
    @Column(name = "razorpay_payment_id")
    private String razorpayPaymentId;

    /** Razorpay signature — stored for audit purposes */
    @Column(name = "razorpay_signature", length = 512)
    private String razorpaySignature;

    // ── Amount ───────────────────────────────────────────────────────────────

    /** Amount in smallest currency unit (paise for INR) */
    @Column(nullable = false)
    private int amount;

    @Column(nullable = false, length = 3)
    private String currency = "INR";

    // ── Status ───────────────────────────────────────────────────────────────

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus status = PaymentStatus.INITIATED;

    // ── Timestamps ───────────────────────────────────────────────────────────

    @Column(name = "initiated_at", nullable = false)
    private LocalDateTime initiatedAt = LocalDateTime.now();

    @Column(name = "captured_at")
    private LocalDateTime capturedAt;

    @Column(name = "failed_at")
    private LocalDateTime failedAt;

    /** Razorpay error description on failure, for support / display */
    @Column(name = "failure_reason", length = 500)
    private String failureReason;

    /** How many times payment was attempted (for retry tracking) */
    @Column(name = "attempt_count", nullable = false)
    private int attemptCount = 1;

    // ── Getters ──────────────────────────────────────────────────────────────

    public String getId()                    { return id; }
    public Application getApplication()      { return application; }
    public String getRazorpayOrderId()       { return razorpayOrderId; }
    public String getRazorpayPaymentId()     { return razorpayPaymentId; }
    public String getRazorpaySignature()     { return razorpaySignature; }
    public int getAmount()                   { return amount; }
    public String getCurrency()              { return currency; }
    public PaymentStatus getStatus()         { return status; }
    public LocalDateTime getInitiatedAt()    { return initiatedAt; }
    public LocalDateTime getCapturedAt()     { return capturedAt; }
    public LocalDateTime getFailedAt()       { return failedAt; }
    public String getFailureReason()         { return failureReason; }
    public int getAttemptCount()             { return attemptCount; }

    // ── Setters ──────────────────────────────────────────────────────────────

    public void setApplication(Application a)          { this.application = a; }
    public void setRazorpayOrderId(String s)           { this.razorpayOrderId = s; }
    public void setRazorpayPaymentId(String s)         { this.razorpayPaymentId = s; }
    public void setRazorpaySignature(String s)         { this.razorpaySignature = s; }
    public void setAmount(int amount)                  { this.amount = amount; }
    public void setCurrency(String currency)           { this.currency = currency; }
    public void setStatus(PaymentStatus status)        { this.status = status; }
    public void setInitiatedAt(LocalDateTime t)        { this.initiatedAt = t; }
    public void setCapturedAt(LocalDateTime t)         { this.capturedAt = t; }
    public void setFailedAt(LocalDateTime t)           { this.failedAt = t; }
    public void setFailureReason(String r)             { this.failureReason = r; }
    public void setAttemptCount(int n)                 { this.attemptCount = n; }

    // ── Business logic ───────────────────────────────────────────────────────

    /** Called by webhook / verify when Razorpay confirms capture */
    public void markCaptured(String paymentId, String signature) {
        this.razorpayPaymentId = paymentId;
        this.razorpaySignature = signature;
        this.status     = PaymentStatus.CAPTURED;
        this.capturedAt = LocalDateTime.now();
    }

    /** Called on payment.failed event — allows brand to retry */
    public void markFailed(String reason) {
        this.status        = PaymentStatus.FAILED;
        this.failedAt      = LocalDateTime.now();
        this.failureReason = reason;
    }

    /** Called when brand retries after a failure — reuses same Payment row */
    public void retryWithNewOrder(String newOrderId) {
        this.razorpayOrderId   = newOrderId;
        this.razorpayPaymentId = null;
        this.razorpaySignature = null;
        this.status            = PaymentStatus.INITIATED;
        this.failedAt          = null;
        this.failureReason     = null;
        this.attemptCount++;
    }
}