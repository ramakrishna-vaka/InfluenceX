package com.project.InfluenceX.controller;

import com.project.InfluenceX.model.User;
import com.project.InfluenceX.service.OtpService;
import com.project.InfluenceX.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * AuthController
 *
 * Endpoints:
 *   POST /auth/otp/send              — send email-verification OTP (after registration)
 *   POST /auth/otp/verify            — verify email OTP → marks user as verified
 *
 *   POST /auth/forgot-password/send         — send password-reset OTP
 *   POST /auth/forgot-password/verify-code  — validate reset OTP (doesn't reset yet)
 *   POST /auth/forgot-password/reset        — verify OTP + set new password in one step
 */
@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "https://www.influencex.online/", allowCredentials = "true")
public class AuthController {

    private final OtpService otpService;
    private final UserService userService;

    public AuthController(OtpService otpService, UserService userService) {
        this.otpService  = otpService;
        this.userService = userService;
    }

    // ── Email verification OTP ────────────────────────────────────────────────

    /**
     * POST /auth/otp/send
     * Body: { "email": "user@example.com" }
     * Sends a 6-digit verification OTP to the email.
     */
    @PostMapping("/otp/send")
    public ResponseEntity<?> sendOtp(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body("Email is required");
        }
        User user = userService.getUserByEmail(email);
        if (user == null) {
            // Don't reveal whether email exists
            return ResponseEntity.ok("OTP sent if account exists");
        }
        otpService.sendVerificationOtp(email);
        return ResponseEntity.ok("OTP sent");
    }

    /**
     * POST /auth/otp/verify
     * Body: { "email": "...", "otp": "123456" }
     * Marks the user's email as verified on success.
     */
    @PostMapping("/otp/verify")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String otp   = body.get("otp");

        if (email == null || otp == null) {
            return ResponseEntity.badRequest().body("Email and OTP are required");
        }

        boolean valid = otpService.verifyOtp(email, otp, "verify");
        if (!valid) {
            return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY)
                    .body("Invalid or expired OTP");
        }

        // Mark user verified
        //userService.markEmailVerified(email);
        return ResponseEntity.ok("Email verified");
    }

    // ── Forgot password ───────────────────────────────────────────────────────

    /**
     * POST /auth/forgot-password/send
     * Body: { "email": "..." }
     * Sends a password-reset OTP. Always returns 200 to avoid email enumeration.
     */
    @PostMapping("/forgot-password/send")
    public ResponseEntity<?> forgotPasswordSend(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body("Email is required");
        }
        User user = userService.getUserByEmail(email);
        if (user != null) {
            otpService.sendPasswordResetOtp(email);
        }
        // Always 200 — prevents email enumeration
        return ResponseEntity.ok("Reset code sent if account exists");
    }

    /**
     * POST /auth/forgot-password/verify-code
     * Body: { "email": "...", "code": "123456" }
     * Validates the reset OTP without consuming it (so /reset can re-verify).
     * Frontend uses this to advance to the "set new password" step.
     */
    @PostMapping("/forgot-password/verify-code")
    public ResponseEntity<?> forgotPasswordVerifyCode(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String code  = body.get("code");

        // Peek-verify: check without consuming so /reset can use it too
        boolean valid = otpService.peekVerifyOtp(email, code, "reset");
        if (!valid) {
            return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY)
                    .body("Invalid or expired code");
        }
        return ResponseEntity.ok("Code valid");
    }

    /**
     * POST /auth/forgot-password/reset
     * Body: { "email": "...", "code": "123456", "newPassword": "..." }
     * Verifies OTP (consumes it) and sets the new password.
     */
    @PostMapping("/forgot-password/reset")
    public ResponseEntity<?> forgotPasswordReset(@RequestBody Map<String, String> body) {
        String email       = body.get("email");
        String code        = body.get("code");
        String newPassword = body.get("newPassword");

        if (email == null || code == null || newPassword == null) {
            return ResponseEntity.badRequest().body("All fields are required");
        }
        if (newPassword.length() < 8) {
            return ResponseEntity.badRequest().body("Password must be at least 8 characters");
        }

        // Consume the OTP
        boolean valid = otpService.verifyOtp(email, code, "reset");
        if (!valid) {
            return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY)
                    .body("Invalid or expired code");
        }

        userService.resetPassword(email, newPassword);
        return ResponseEntity.ok("Password updated");
    }
}