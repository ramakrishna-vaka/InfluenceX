package com.project.InfluenceX.controller;

import com.project.InfluenceX.model.RequestDTO.ProfileRequestDTO;
import com.project.InfluenceX.model.ResponseDTO.ProfileResponseDTO;
import com.project.InfluenceX.model.User;
import com.project.InfluenceX.service.JwtService;
import com.project.InfluenceX.service.ProfileService;
import com.project.InfluenceX.service.UserService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/profile")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class ProfileController {

    private final ProfileService profileService;
    private final UserService userService;
    private final JwtService jwtService;

    public ProfileController(ProfileService profileService,UserService userService, JwtService jwtService){
        this.profileService=profileService;
        this.userService = userService;
        this.jwtService = jwtService;
    }

    /**
     * Get profile by user ID (or current user if no ID provided)
     * GET /api/profile/{userId}
     * GET /api/profile (gets current user's profile)
     */
    @GetMapping({"", "/{userId}"})
    public ResponseEntity<?> getProfile(@PathVariable(required = false) Long userId,HttpServletRequest request) {
        try {
            // If no userId provided, get current authenticated user's ID
            if (userId == null) {
                userId = getCurrentUserId(request);
            }

            ProfileResponseDTO profile = profileService.getProfile(userId);
            return ResponseEntity.ok(profile);

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(createErrorResponse("User not found", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Error fetching profile", e.getMessage()));
        }
    }

    /**
     * Update current user's profile
     * PUT /api/profile
     */
    @PutMapping
    public ResponseEntity<?> updateProfile(@Valid @RequestBody ProfileRequestDTO profileData, HttpServletRequest request) {
        try {
            Long currentUserId = getCurrentUserId(request);
            ProfileResponseDTO updatedProfile = profileService.updateProfile(currentUserId, profileData);
            return ResponseEntity.ok(updatedProfile);

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(createErrorResponse("Update failed", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Error updating profile", e.getMessage()));
        }
    }

    /**
     * Disconnect a social media profile
     * DELETE /api/profile/social/{platform}
     */
    @DeleteMapping("/social/{platform}")
    public ResponseEntity<?> disconnectSocialProfile(@PathVariable String platform,HttpServletRequest request) {
        try {
            Long currentUserId = getCurrentUserId(request);
            profileService.disconnectSocialProfile(currentUserId, platform);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", platform + " disconnected successfully");

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(createErrorResponse("Disconnect failed", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Error disconnecting social profile", e.getMessage()));
        }
    }

    /**
     * Helper method to get current authenticated user's ID
     * In production, extract from JWT token or Spring Security context
     */
    private Long getCurrentUserId(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return null;
        }

        // Step 2: Look for the authToken cookie
        String token = null;
        for (Cookie cookie : cookies) {
            if ("authToken".equals(cookie.getName())) {
                token = cookie.getValue();
                break;
            }
        }

        // ❗ If token missing → return 401 immediately (avoid exceptions)
        if (token == null || token.isEmpty()) {
            return null;
        }

        //TODO
//        if (!jwtService.validateToken(token)) {
//            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");
//        }

        // Step 3: Extract user email from the JWT and fetch user info
        String email = jwtService.extractEmail(token);
        User user = userService.getUserByEmail(email);

        if (user == null) {
            return null;
        }

        if (token == null || !jwtService.validateToken(token,user)) {
            return null;
        }
        return  user.getId();
    }

    /**
     * Create error response map
     */
    private Map<String, Object> createErrorResponse(String error, String message) {
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("success", false);
        errorResponse.put("error", error);
        errorResponse.put("message", message);
        return errorResponse;
    }
}