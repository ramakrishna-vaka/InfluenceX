package com.project.InfluenceX.controller;

import com.project.InfluenceX.model.ResponseDTO.WalletResponseDTO;
import com.project.InfluenceX.model.User;
import com.project.InfluenceX.service.AuthService;
import com.project.InfluenceX.service.JwtService;
import com.project.InfluenceX.service.WalletService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * WalletController
 *
 * GET  /wallet          — fetch balance + transaction history
 * POST /wallet/withdraw — withdraw to bank account
 *
 * Auth: reads email from the authToken JWT cookie (same pattern as LoginController).
 */
@RestController
@RequestMapping("/wallet")
@CrossOrigin(origins = "https://www.influencex.online/", allowCredentials = "true")
public class WalletController {

    private final WalletService walletService;
    private final AuthService authService;

    public WalletController(WalletService walletService, AuthService authService) {
        this.walletService = walletService;
        this.authService    = authService;
    }

    // ── GET /wallet ───────────────────────────────────────────────────────────

    @GetMapping
    public ResponseEntity<?> getWallet(HttpServletRequest request) {
        User user = authService.getUser(request);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated");
        }
        try {
            WalletResponseDTO wallet = walletService.getWallet(user);
            return ResponseEntity.ok(wallet);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to load wallet");
        }
    }

    // ── POST /wallet/withdraw ─────────────────────────────────────────────────

    @PostMapping("/withdraw")
    public ResponseEntity<?> withdraw(@RequestBody Map<String, Object> body,
                                      HttpServletRequest request) {
        User user = authService.getUser(request);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated");
        }

        try {
            double amount        = Double.parseDouble(body.get("amount").toString());
            String accountNumber = body.get("accountNumber").toString().trim();
            String ifsc          = body.get("ifsc").toString().trim().toUpperCase();

            if (accountNumber.isEmpty() || ifsc.isEmpty()) {
                return ResponseEntity.badRequest().body("Account number and IFSC are required");
            }

            walletService.withdraw(user, amount, accountNumber, ifsc);
            return ResponseEntity.ok("Withdrawal initiated successfully");

        } catch (IllegalArgumentException e) {
            // Validation errors from service (min balance, insufficient funds)
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Withdrawal failed. Please try again.");
        }
    }

}