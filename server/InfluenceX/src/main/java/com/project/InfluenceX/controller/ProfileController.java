package com.project.InfluenceX.controller;

import com.project.InfluenceX.model.RequestDTO.PhoneNumberVerificationRequestDTO;
import com.project.InfluenceX.model.RequestDTO.ProfileRequestDTO;
import com.project.InfluenceX.model.ResponseDTO.ProfileResponseDTO;
import com.project.InfluenceX.model.User;
import com.project.InfluenceX.service.AuthService;
import com.project.InfluenceX.service.JwtService;
import com.project.InfluenceX.service.ProfileService;
import com.project.InfluenceX.service.UserService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/profile")
@CrossOrigin(origins = "https://www.influencex.online/", allowCredentials = "true")
public class ProfileController {

    private final ProfileService profileService;
    private final AuthService authService;

    public ProfileController(ProfileService profileService,AuthService authService){
        this.profileService=profileService;
        this.authService=authService;
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
                userId = authService.getUser(request).getId();
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
    @PutMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateProfile(@Valid @ModelAttribute ProfileRequestDTO profileData, HttpServletRequest request) {
        try {
            User user = authService.getUser(request);
            Long currentUserId = user.getId();
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
            Long currentUserId = authService.getUser(request).getId();
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
     * Create error response map
     */
    private Map<String, Object> createErrorResponse(String error, String message) {
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("success", false);
        errorResponse.put("error", error);
        errorResponse.put("message", message);
        return errorResponse;
    }


    /**
     * phone number verification
     */
    @PutMapping("/verify-phone")
    public ResponseEntity<?> generateOtp(@RequestBody PhoneNumberVerificationRequestDTO dto, HttpServletRequest request){
        Long userId=authService.getUser(request).getId();
        String phoneNumber=dto.getPhoneNumber();

        profileService.sendPhoneVerificationOtp(userId, phoneNumber);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "OTP sent successfully"
        ));
    }

    @PutMapping("/confirm-phone")
    public ResponseEntity<?> confirmOTP(@RequestBody PhoneNumberVerificationRequestDTO dto,HttpServletRequest request) {

        Long userId = authService.getUser(request).getId();

        String phone = dto.getPhoneNumber();
        String otp = dto.getOtp();

        profileService.verifyPhoneOtp(userId, phone, otp);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Phone verified successfully"
        ));
    }

    @GetMapping("/delete-phone")
    public ResponseEntity<?> deletePhone(HttpServletRequest request) {

        Long userId = authService.getUser(request).getId();

        profileService.deletePhoneNumber(userId);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Phone number removed successfully"
        ));
    }

}