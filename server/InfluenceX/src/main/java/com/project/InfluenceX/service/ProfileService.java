package com.project.InfluenceX.service;

import com.project.InfluenceX.model.PhoneVerification;
import com.project.InfluenceX.model.RequestDTO.ProfileRequestDTO;
import com.project.InfluenceX.model.ResponseDTO.ProfileResponseDTO;
import com.project.InfluenceX.model.User;
import com.project.InfluenceX.repository.PhoneVerificationRepository;
import com.project.InfluenceX.repository.ProfileRepository;
import com.project.InfluenceX.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Base64;
import java.util.Random;

@Service
public class ProfileService {

    private final ProfileRepository profileRepository;
    private final UserRepository userRepository;
    private final PhoneVerificationRepository phoneVerificationRepository;

    public ProfileService(ProfileRepository profileRepository,UserRepository userRepository, PhoneVerificationRepository phoneVerificationRepository){
        this.profileRepository=profileRepository;
        this.userRepository=userRepository;
        this.phoneVerificationRepository=phoneVerificationRepository;
    }

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("MMM dd, yyyy");

    /**
     * Get user profile by ID
     */
    @Transactional(readOnly = true)
    public ProfileResponseDTO getProfile(Long userId) {
        User user = profileRepository.findByIdWithSocialProfiles(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        return mapToProfileResponse(user);
    }

    /**
     * Update user profile
     */
    @Transactional
    public ProfileResponseDTO updateProfile(Long userId, @Valid ProfileRequestDTO request) {
        User user = profileRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        // Update basic fields
        if (request.getName() != null && !request.getName().isBlank()) {
            user.setName(request.getName());
        }

        if (request.getBio() != null) {
            user.setBio(request.getBio());
        }

        if (request.getPhone() != null) {
            user.setPhoneNumber(request.getPhone());
            // Note: Actual phone verification should be triggered separately
        }

        if (request.getLocation() != null) {
            user.setLocation(request.getLocation());
        }

        user.setUpdatedAt(LocalDateTime.now());

        User updatedUser = profileRepository.save(user);
        return mapToProfileResponse(updatedUser);
    }

    /**
     * Delete social media profile
     */
    @Transactional
    public void disconnectSocialProfile(Long userId, String platform) {
        User user = profileRepository.findByIdWithSocialProfiles(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        user.getSocialMediaProfiles().removeIf(profile ->
                profile.getPlatform().name().equalsIgnoreCase(platform));

        user.setUpdatedAt(LocalDateTime.now());

        // Update verification status
        //updateVerificationStatus(user);

        profileRepository.save(user);
    }

    /**
     * Update user verification status based on criteria
     */
//    private void updateVerificationStatus(User user) {
//        // User is verified if they have:
//        // 1. Phone number verified
//        // 2. Instagram connected
//        // 3. YouTube connected
//
//        boolean hasInstagram = user.getSocialMediaProfiles() != null &&
//                user.getSocialMediaProfiles().stream()
//                        .anyMatch(p -> "INSTAGRAM".equals(p.getPlatform().name()));
//
//        boolean hasYouTube = user.getSocialMediaProfiles() != null &&
//                user.getSocialMediaProfiles().stream()
//                        .anyMatch(p -> "YOUTUBE".equals(p.getPlatform().name()));
//
//        // For now, we'll check phoneNumber presence (actual verification would require a separate flow)
//        boolean hasPhone = user.getPhoneNumber() != null && !user.getPhoneNumber().isEmpty();
//
//        user.setVerified(hasPhone && hasInstagram && hasYouTube);
//    }

    /**
     * Map User entity to ProfileResponseDTO
     */
    private ProfileResponseDTO mapToProfileResponse(User user) {
        ProfileResponseDTO response = new ProfileResponseDTO();

        response.setId(user.getId());
        response.setName(user.getName());
        response.setEmail(user.getEmail());
        response.setPhone(user.getPhoneNumber());
        response.setLocation(user.getLocation());
        response.setBio(user.getBio());
        response.setUsername(user.getUsername());
        response.setRole(user.getRole());
        //response.setVerified(user.isVerified());
        response.setCreatedAt(user.getCreatedAt());

        // Phone verified status (in production, this would come from a separate verification table)
        response.setPhoneVerified(user.getPhoneNumber() != null && !user.getPhoneNumber().isEmpty());

        // Convert image data to base64 if present
        if (user.getImageData() != null && user.getImageData().length > 0) {
            String base64Image = Base64.getEncoder().encodeToString(user.getImageData());
            response.setAvatar("data:image/jpeg;base64," + base64Image);
        }

        // Category - derive from role or posts
        response.setCategory(deriveCategory(user));

        // Map social media profiles
//        if (user.getSocialMediaProfiles() != null) {
//            List<SocialMediaProfileDTO> socialProfiles = user.getSocialMediaProfiles().stream()
//                    .map(this::mapToSocialMediaDTO)
//                    .collect(Collectors.toList());
//            response.setSocialMediaProfiles(socialProfiles);
//        } else {
//            response.setSocialMediaProfiles(new ArrayList<>());
//        }

        // Map stats
        //response.setStats(buildStats(user));

        // Map posts
//        if (user.getPostsCreated() != null) {
//            List<PostSummaryDTO> posts = user.getPostsCreated().stream()
//                    .limit(10) // Limit to recent 10 posts
//                    .map(this::mapToPostSummary)
//                    .collect(Collectors.toList());
//            response.setCreatedPosts(posts);
//        } else {
//            response.setCreatedPosts(new ArrayList<>());
//        }

        // Map collaborations (TODO: implement when collaboration entity is ready)
        response.setCollaborations(new ArrayList<>());

        return response;
    }

    /**
     * Map SocialMediaProfile to DTO
     */
//    private SocialMediaProfileDTO mapToSocialMediaDTO(SocialMediaProfile profile) {
//        return new SocialMediaProfileDTO(
//                profile.getId(),
//                profile.getPlatform().name(),
//                profile.getUsername(),
//                profile.getHandle(),
//                profile.getProfileUrl(),
//                profile.getFollowersCount(),
//                profile.getEngagementRate()
//        );
//    }

    /**
     * Map Post to summary DTO
     */
//    private PostSummaryDTO mapToPostSummary(Posts post) {
//        String formattedDate = post.getCreatedAt() != null
//                ? post.getCreatedAt().format(DATE_FORMATTER)
//                : "Unknown";
//
//        return new PostSummaryDTO(
//                post.getId(),
//                post.getTitle(),
//                post.getDescription(),
//                post.getStatus() != null ? post.getStatus().name() : "DRAFT",
//                formattedDate
//        );
//    }
//
//    /**
//     * Build stats DTO
//     */
//    private ProfileStatsDTO buildStats(User user) {
//        ProfileStatsDTO stats = new ProfileStatsDTO();
//
//        stats.setTotalCollaborations(user.getTotalCollaborations());
//        stats.setActiveCollaborations(0); // TODO: Calculate from actual collaborations
//        stats.setCompletedCollaborations(0); // TODO: Calculate from actual collaborations
//        stats.setTotalEarnings(user.getTotalEarnings());
//        stats.setAvgRating(user.getAverageRating());
//        stats.setRatingCount(user.getRatingCount());
//        stats.setTotalPosts(user.getPostsCreated() != null ? user.getPostsCreated().size() : 0);
//
//        return stats;
//    }

    /**
     * Derive category from user data
     */
    private String deriveCategory(User user) {
        // This could be based on:
        // 1. User's most common post categories
        // 2. Social media niche
        // 3. Explicitly set category (add field to User if needed)

        // For now, return a default based on role
//        if (user.getRole() != null) {
//            switch (user.getRole()) {
//                case INFLUENCER:
//                    return "Content Creator";
//                case BRAND:
//                    return "Brand";
//                default:
//                    return "General";
//            }
//        }
        return "General";
    }


    public void sendPhoneVerificationOtp(Long userId, String phone) {

        // 1. Generate OTP
        String otp = generateOtp();

        // 2. Set expiry (5 minutes)
        LocalDateTime expiry = LocalDateTime.now().plusMinutes(5);

        // 3. Save to DB
        PhoneVerification verification = new PhoneVerification();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        verification.setUser(user);

        verification.setPhoneNumber(phone);
        verification.setOtp(Integer.parseInt(otp));
        verification.setExpiresAt(expiry);

        phoneVerificationRepository.save(verification);

        // 4. Send SMS
        //smsService.sendOtp(phone, otp);
        System.out.println("Generated Otp = "+otp);
    }

    private String generateOtp() {
        Random random = new Random();
        return String.valueOf(100000 + random.nextInt(900000));
    }

    public void verifyPhoneOtp(Long userId, String phone, String otp) {

        PhoneVerification verification =
                phoneVerificationRepository
                        .findTopByUser_IdAndPhoneNumberOrderByExpiresAtDesc(userId, phone)
                        .orElseThrow(() -> new RuntimeException("OTP not found"));

        if (verification.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP expired");
        }

        if (!String.valueOf(verification.getOtp()).equals(otp)) {
            throw new RuntimeException("Invalid OTP");
        }

        // Mark user phone verified
        User user = userRepository.findById(userId).orElseThrow();

        user.setPhoneNumber(phone);
        user.setVerified(true);

        userRepository.save(user);
    }


    public void deletePhoneNumber(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

       user.setPhoneNumber(null);
       user.setVerified(false);
       userRepository.save(user);
    }





}