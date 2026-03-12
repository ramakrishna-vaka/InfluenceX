package com.project.InfluenceX.controller;

import com.project.InfluenceX.service.OAuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequestMapping("/api/auth/oauth")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class OAuthController {

    private final OAuthService oauthService;

    public OAuthController(OAuthService oauthService){
        this.oauthService=oauthService;
    }

    @GetMapping("/{platform}")
    public void redirectToProvider(
            @PathVariable String platform,
            HttpServletResponse response
    ) throws IOException {

        String redirectUrl = oauthService.getAuthorizationUrl(platform);

        response.sendRedirect(redirectUrl);
    }

    @GetMapping("/{platform}/callback")
    public ResponseEntity<?> handleCallback(
            @PathVariable String platform,
            @RequestParam String code,
            HttpServletRequest request
    ) {

        Long currentUserId = getCurrentUserId(request);

        oauthService.processOAuthCallback(platform, code, currentUserId);

        return ResponseEntity.ok("Connected successfully");
    }

    private Long getCurrentUserId(HttpServletRequest request) {
        // Get from JWT / session
        return (Long) request.getAttribute("userId");
    }
}
