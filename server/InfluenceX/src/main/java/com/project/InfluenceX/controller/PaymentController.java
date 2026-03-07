package com.project.InfluenceX.controller;

import com.project.InfluenceX.service.PaymentService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Formatter;
import java.util.Map;

/**
 * PaymentController
 *
 * POST /payment/order   — brand accepts deliverables → creates Razorpay order
 * POST /payment/verify  — frontend calls after successful checkout
 * POST /payment/failed  — frontend calls when Razorpay fires payment.failed
 * POST /payment/webhook — Razorpay server-to-server (configure in dashboard)
 *
 * Razorpay dashboard webhook URL : https://yourdomain.com/payment/webhook
 * Events to subscribe            : payment.captured, payment.failed
 */
@RestController
@RequestMapping("/payment")
@CrossOrigin(origins = "http://localhost:5173",allowCredentials = "true")
public class PaymentController {

    private final PaymentService paymentService;

    @Value("${razor.pay.test.key.id}")
    private String razorpayKeyId;

    @Value("${razor.pay.test.key.secret}")
    private String razorpaySecret;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    // ── Create order (brand accepts deliverables) ─────────────────────────────
    @PostMapping("/order/{applicationId}")
    public ResponseEntity<?> createOrder(
            @PathVariable String applicationId
    ) {
        Map<String, Object> order =
                paymentService.createOrder(applicationId);
        return ResponseEntity.ok(order);
    }

    // ── Frontend: verify after successful checkout ────────────────────────────
    @PostMapping("/verify")
    public ResponseEntity<?> verify(@RequestBody Map<String, String> body) {
        String orderId   = body.get("razorpayOrderId");
        String paymentId = body.get("razorpayPaymentId");
        String signature = body.get("razorpaySignature");

        if (!verifyHmac(orderId + "|" + paymentId, signature)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid signature"));
        }

        paymentService.markCaptured(orderId, paymentId, signature);
        return ResponseEntity.ok(Map.of("status", "settled"));
    }

    // ── Frontend: payment failed callback ────────────────────────────────────
    @PostMapping("/failed")
    public ResponseEntity<?> failed(@RequestBody Map<String, String> body) {
        paymentService.markFailed(body.get("razorpayOrderId"), body.get("reason"));
        return ResponseEntity.ok(Map.of("status", "payment_failed"));
    }

    // ── Razorpay webhook (server-to-server) ──────────────────────────────────
    @PostMapping("/webhook")
    public ResponseEntity<?> webhook(
            @RequestBody String rawBody,
            @RequestHeader("X-Razorpay-Signature") String webhookSig
    ) {
        if (!verifyHmac(rawBody, webhookSig)) {
            return ResponseEntity.status(400).body("Invalid signature");
        }

        try {
            org.json.JSONObject json    = new org.json.JSONObject(rawBody);
            String event                = json.getString("event");
            org.json.JSONObject payment = json
                    .getJSONObject("payload")
                    .getJSONObject("payment")
                    .getJSONObject("entity");

            String orderId   = payment.optString("order_id", "");
            String paymentId = payment.getString("id");

            switch (event) {
                case "payment.captured" ->
                        paymentService.markCaptured(orderId, paymentId, webhookSig);
                case "payment.failed" ->
                        paymentService.markFailed(orderId,
                                payment.optJSONObject("error_description") != null
                                        ? payment.getJSONObject("error_description").optString("description", "")
                                        : "Payment failed");
            }
        } catch (Exception e) {
            // Always 200 to Razorpay — log internally
            System.err.println("Webhook error: " + e.getMessage());
        }

        return ResponseEntity.ok("OK");
    }

    // ── HMAC-SHA256 helper ────────────────────────────────────────────────────
    private boolean verifyHmac(String payload, String expected) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(
                    razorpaySecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] hash = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            Formatter fmt = new Formatter();
            for (byte b : hash) fmt.format("%02x", b);
            return fmt.toString().equals(expected);
        } catch (Exception e) {
            return false;
        }
    }
}