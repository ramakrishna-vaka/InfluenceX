package com.project.InfluenceX.service;

import com.sendgrid.*;
import com.sendgrid.helpers.mail.*;
import com.sendgrid.helpers.mail.objects.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpService {

    @Value("${sendgrid.api-key}")
    private String sendGridApiKey;

    @Value("${sendgrid.from-email}")
    private String fromEmail;

    @Value("${sendgrid.from-name}")
    private String fromName;

    private final Map<String, OtpEntry> store = new ConcurrentHashMap<>();
    private static final int TTL_MINUTES = 10;

    // ── Generate & send OTP ───────────────────────────────────────────────────

    public void sendVerificationOtp(String email) {
        String otp = generateOtp();
        store.put(email + ":verify", new OtpEntry(otp));
        sendEmail(
                email,
                "InfluenceX — Verify your email",
                "Your email verification code is: <strong>" + otp + "</strong>"
                        + "<br><br>This code expires in " + TTL_MINUTES + " minutes."
        );
    }

    public void sendPasswordResetOtp(String email) {
        String otp = generateOtp();
        store.put(email + ":reset", new OtpEntry(otp));
        sendEmail(
                email,
                "InfluenceX — Password reset code",
                "Your password reset code is: <strong>" + otp + "</strong>"
                        + "<br><br>This code expires in " + TTL_MINUTES + " minutes."
                        + "<br><br>If you didn't request this, ignore this email."
        );
    }

    // ── Verify OTP ────────────────────────────────────────────────────────────

    public boolean verifyOtp(String email, String code, String type) {
        String key = email + ":" + type;
        OtpEntry entry = store.get(key);
        if (entry == null) return false;
        if (entry.isExpired()) { store.remove(key); return false; }
        if (!entry.code.equals(code)) return false;
        store.remove(key); // single-use
        return true;
    }

    public boolean peekVerifyOtp(String email, String code, String type) {
        String key = email + ":" + type;
        OtpEntry entry = store.get(key);
        if (entry == null) return false;
        if (entry.isExpired()) { store.remove(key); return false; }
        return entry.code.equals(code);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private String generateOtp() {
        return String.format("%06d", new SecureRandom().nextInt(1_000_000));
    }

    private void sendEmail(String to, String subject, String htmlBody) {
        Email from    = new Email(fromEmail, fromName);
        Email toEmail = new Email(to);
        Content content = new Content("text/html", htmlBody);
        Mail mail = new Mail(from, subject, toEmail, content);

        SendGrid sg = new SendGrid(sendGridApiKey);
        Request request = new Request();
        try {
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());
            Response response = sg.api(request);

            if (response.getStatusCode() >= 400) {
                throw new RuntimeException(
                        "SendGrid error " + response.getStatusCode()
                                + ": " + response.getBody()
                );
            }
        } catch (IOException e) {
            throw new RuntimeException("Failed to send email via SendGrid", e);
        }
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
}