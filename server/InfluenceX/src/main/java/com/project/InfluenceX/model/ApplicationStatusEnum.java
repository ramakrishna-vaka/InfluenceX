package com.project.InfluenceX.model;

public enum ApplicationStatusEnum {
    SETTLED, //when influencer received payment
    PENDING, //when application created, it is in pending state
    ACCEPTED, //when brand approves the application, then it is accepted and influencer can start working on it.
    IN_PROGRESS, // basically it is only in progress
    REJECTED, // when brand rejects the application.
    WITHDRAW, //when influencer withdraws the application
    PENDING_DELIVERABLES, //when the deliverables deadline is over but the deliverables are not submitted
    DELIVERABLES_SUBMITTED,
    REVIEWING, //submitted deliverables are in review state
    DELIVERABLES_ACCEPTED, //brand accepted deliverables
    DELIVERABLES_REJECTED, //brand rejected deliverables
    PAYMENT_PENDING, //brand side
    PAYMENT_SUCCESS, //payment success on brand side
    PAYMENT_FAILED, //brand side
    PAYMENT_RECEIVING, // influencer receiving payment
}
