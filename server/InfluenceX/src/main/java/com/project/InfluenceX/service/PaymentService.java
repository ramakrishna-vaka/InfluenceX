package com.project.InfluenceX.service;

import com.project.InfluenceX.model.*;
import com.project.InfluenceX.repository.ApplicationRepository;
import com.project.InfluenceX.repository.PaymentRepository;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;

@Service
public class PaymentService {

    private final PaymentRepository    paymentRepository;
    private final ApplicationRepository applicationRepository;

    @Value("${razor.pay.test.key.id}")
    private String razorpayKeyId;

    @Value("${razor.pay.test.key.secret}")
    private String razorpayKeySecret;

    public PaymentService(PaymentRepository paymentRepository,
                          ApplicationRepository applicationRepository) {
        this.paymentRepository    = paymentRepository;
        this.applicationRepository = applicationRepository;
    }

    // ── Create Razorpay order + Payment record ────────────────────────────────

    /**
     * Called when brand clicks "Accept & Pay".
     * Creates (or retries) a Payment row and a Razorpay order.
     * Returns the order details the frontend hands to Razorpay checkout.
     */
    @Transactional
    public Map<String, Object> createOrder(String applicationId) {
        Application app = applicationRepository.findById(Long.parseLong(applicationId))
                .orElseThrow(() -> new RuntimeException("Application not found: " + applicationId));

        // Reuse existing Payment row if brand is retrying after failure
        Payment payment = paymentRepository.findByApplication_Id(Long.parseLong(applicationId))
                .orElse(null);

        int amountPaise = (int)(Integer.parseInt(app.getPost().getCompensationDescription()) * 100); // INR → paise

        try {
            RazorpayClient client = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

            JSONObject orderReq = new JSONObject()
                    .put("amount",   amountPaise)
                    .put("currency", "INR")
                    .put("receipt",  "rcpt_" + applicationId)
                    .put("notes", new JSONObject()
                            .put("applicationId", applicationId));

            Order rzpOrder = client.orders.create(orderReq);
            String orderId = rzpOrder.get("id").toString();

            if (payment == null) {
                // First attempt — create new Payment record
                payment = new Payment();
                payment.setApplication(app);
                payment.setAmount(amountPaise);
                payment.setCurrency("INR");
                payment.setRazorpayOrderId(orderId);
                payment.setStatus(PaymentStatus.INITIATED);
            } else {
                // Retry — update existing record
                payment.retryWithNewOrder(orderId);
            }

            paymentRepository.save(payment);
            app.setStatus(ApplicationStatusEnum.PAYMENT_PENDING);
//            app.setStatus(ApplicationStatusEnum.PAYMENT_SUCCESS); //temp
//            app.setStatus(ApplicationStatusEnum.PAYMENT_RECEIVING); //temp
//            app.setStatus(ApplicationStatusEnum.SETTLED); //temp
            applicationRepository.save(app);

            return Map.of(
                    "orderId",       orderId,
                    "amount",        amountPaise,
                    "currency",      "INR",
                    "keyId",         razorpayKeyId,
                    "applicationId", applicationId
            );

        } catch (Exception e) {
            throw new RuntimeException("Razorpay order creation failed: " + e.getMessage(), e);
        }
    }

    // ── Mark payment captured (webhook payment.captured OR frontend /verify) ──

    @Transactional
    public void markCaptured(String razorpayOrderId,
                             String razorpayPaymentId,
                             String razorpaySignature) {

        Payment payment = paymentRepository.findByRazorpayOrderId(razorpayOrderId)
                .orElseThrow(() -> new RuntimeException("Payment not found for order: " + razorpayOrderId));

        // Idempotency guard — webhook can fire more than once
        if (payment.getStatus() == PaymentStatus.CAPTURED) return;

        payment.markCaptured(razorpayPaymentId, razorpaySignature);
        paymentRepository.save(payment);
        Application app = payment.getApplication();
        app.setStatus(ApplicationStatusEnum.PAYMENT_SUCCESS);
        app.setStatus(ApplicationStatusEnum.PAYMENT_RECEIVING);
        //app.setPaidAt(LocalDateTime.now());
        applicationRepository.save(app);
    }

    // ── Mark payment failed ───────────────────────────────────────────────────

    @Transactional
    public void markFailed(String razorpayOrderId, String reason) {
        Payment payment = paymentRepository.findByRazorpayOrderId(razorpayOrderId)
                .orElseThrow(() -> new RuntimeException("Payment not found for order: " + razorpayOrderId));

        payment.markFailed(reason);
        paymentRepository.save(payment);

        // Advance application → PAYMENT_FAILED
        Application app = payment.getApplication();
        app.setStatus(ApplicationStatusEnum.PAYMENT_FAILED);
        applicationRepository.save(app);
    }

    // ── private helper ────────────────────────────────────────────────────────

    private void addAppStatus(Application app, String statusEnum) {
//        ApplicationStatus st = new ApplicationStatus();
//        st.setStatusEnum(statusEnum);
//        st.setTime(LocalDateTime.now());
//        app.getApplicationStatus().add(st);
        //Do nothing as of now
    }

    public void savePayment(Payment payment){
        paymentRepository.save(payment);
    }
}