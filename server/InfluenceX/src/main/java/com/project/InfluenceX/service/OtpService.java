package com.project.InfluenceX.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * OtpService
 *
 * Handles two flows:
 *   1. Email verification OTP (registration)
 *   2. Password reset OTP (forgot password)
 *
 * OTPs are stored in-memory with a 10-minute TTL.
 * In production, replace the in-memory store with a Redis cache.
 *
 * Spring Mail setup — add to application.properties:
 *   spring.mail.host=smtp.gmail.com
 *   spring.mail.port=587
 *   spring.mail.username=your-email@gmail.com
 *   spring.mail.password=your-app-password
 *   spring.mail.properties.mail.smtp.auth=true
 *   spring.mail.properties.mail.smtp.starttls.enable=true
 *
 * Maven dependency:
 *   <dependency>
 *     <groupId>org.springframework.boot</groupId>
 *     <artifactId>spring-boot-starter-mail</artifactId>
 *   </dependency>
 */
@Service
public class OtpService {

    private final JavaMailSender mailSender;

    // email → OtpEntry  (works for both verification and reset)
    private final Map<String, OtpEntry> store = new ConcurrentHashMap<>();

    private static final int TTL_MINUTES = 10;

    public OtpService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    // ── Generate & send OTP ───────────────────────────────────────────────────

    public void sendVerificationOtp(String email) {
        String otp = generateOtp();
        store.put(email + ":verify", new OtpEntry(otp));
        sendEmail(email,
                "InfluenceX — Verify your email",
                "Your email verification code is: " + otp + "\n\nThis code expires in " + TTL_MINUTES + " minutes.");
    }

    public void sendPasswordResetOtp(String email) {
        String otp = generateOtp();
        store.put(email + ":reset", new OtpEntry(otp));
        sendEmail(email,
                "InfluenceX — Password reset code",
                "Your password reset code is: " + otp + "\n\nThis code expires in " + TTL_MINUTES + " minutes.\n\nIf you didn't request this, ignore this email.");
    }

    // ── Verify OTP ────────────────────────────────────────────────────────────

    /**
     * Returns true and removes the entry if valid, false otherwise
     */
    public boolean verifyOtp(String email, String code, String type) {
        String key = email + ":" + type;
        OtpEntry entry = store.get(key);
        if (entry == null) return false;
        if (entry.isExpired()) {
            store.remove(key);
            return false;
        }
        if (!entry.code.equals(code)) return false;
        store.remove(key); // single-use
        return true;
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private String generateOtp() {
        return String.format("%06d", new SecureRandom().nextInt(1_000_000));
    }

    private void sendEmail(String to, String subject, String text) {
        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setTo(to);
        msg.setSubject(subject);
        msg.setText(text);
        mailSender.send(msg);
    }

    // ── Inner record ──────────────────────────────────────────────────────────

    private static class OtpEntry {
        final String code;
        final LocalDateTime expiresAt;

        OtpEntry(String code) {
            this.code = code;
            this.expiresAt = LocalDateTime.now().plusMinutes(TTL_MINUTES);
        }

        boolean isExpired() {
            return LocalDateTime.now().isAfter(expiresAt);
        }
    }
// ─── Add this method to OtpService ───────────────────────────────────────────
// Used by /forgot-password/verify-code to check without consuming the OTP,
// so the same OTP can be re-verified in the subsequent /reset call.

    public boolean peekVerifyOtp(String email, String code, String type) {
        String key = email + ":" + type;
        OtpEntry entry = store.get(key);
        if (entry == null) return false;
        if (entry.isExpired()) {
            store.remove(key);
            return false;
        }
        return entry.code.equals(code);
        // NOTE: does NOT remove from store — /reset will call verifyOtp() which does
    }
}