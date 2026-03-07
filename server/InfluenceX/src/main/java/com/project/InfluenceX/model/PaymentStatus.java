package com.project.InfluenceX.model;

public enum PaymentStatus {

    /** Razorpay order created, awaiting user to complete checkout */
    INITIATED,

    /** Razorpay confirmed payment.captured (money received) */
    CAPTURED,

    /** Razorpay reported payment.failed */
    FAILED,

    /** Brand retrying after a previous FAILED attempt */
    RETRYING,

    /** Payment reversed / refunded (future use) */
    REFUNDED
}