package com.project.InfluenceX.service;

import org.springframework.beans.factory.annotation.Value;
import com.project.InfluenceX.model.SocialMediaProfile;
import com.project.InfluenceX.model.SocialPlatform;
import com.project.InfluenceX.repository.SocialMediaProfileRepository;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;


@Service
public class OAuthService {

    private final SocialMediaProfileRepository repository;
    private final RestTemplate restTemplate = new RestTemplate();
    private final AuthService authService;

    public OAuthService(SocialMediaProfileRepository socialMediaProfileRepository, AuthService authService){
        this.repository=socialMediaProfileRepository;
        this.authService=authService;
    }

    @Value("${instagram.client-id}")
    private String instagramClientId;

    @Value("${instagram.client-secret}")
    private String instagramClientSecret;

    @Value("${instagram.redirect-uri}")
    private String instagramRedirectUri;

    @Value("${google.client.id}")
    private String googleClientId;

//    @Value("${google.client-secret}")
//    private String googleClientSecret;
//
//    @Value("${google.redirect-uri}")
//    private String googleRedirectUri;

    public String getAuthorizationUrl(String platform) {

        if ("instagram".equals(platform)) {

            return "https://www.instagram.com/oauth/authorize"
                    + "?client_id=" + instagramClientId
                    + "&redirect_uri=" + instagramRedirectUri
                    + "&scope=instagram_business_basic"
                    + "&response_type=code";

        } else if ("youtube".equals(platform)) {

            return "https://accounts.google.com/o/oauth2/v2/auth"
                    + "?client_id=" + googleClientId
                    //+ "&redirect_uri=" + googleRedirectUri
                    + "&response_type=code"
                    + "&scope=https://www.googleapis.com/auth/youtube.readonly"
                    + "&access_type=offline";
        }

        throw new RuntimeException("Unsupported platform");
    }

    public void processOAuthCallback(
            String platform,
            String code,
            Long userId
    ) {

        if ("instagram".equals(platform)) {
            connectInstagram(code, userId);
        } else if ("youtube".equals(platform)) {
            connectYouTube(code, userId);
        }
    }

    private void connectInstagram(String code, Long userId) {

        // Exchange code for token
        Map<String, String> body = new HashMap<>();
        body.put("client_id", instagramClientId);
        body.put("client_secret", instagramClientSecret);
        body.put("grant_type", "authorization_code");
        body.put("redirect_uri", instagramRedirectUri);
        body.put("code", code);

        Map response = restTemplate.postForObject(
                "https://api.instagram.com/oauth/access_token",
                body,
                Map.class
        );

        String accessToken = (String) response.get("access_token");

        String igUserId = String.valueOf(response.get("user_id"));
        String profileUrl = "https://graph.instagram.com/v21.0/" + igUserId
                + "?fields=id,username"
                + "&access_token=" + accessToken;

        Map profile = restTemplate.getForObject(profileUrl, Map.class);

        saveSocialAccount(
                userId,
                "instagram",
                (String) profile.get("id"),
                (String) profile.get("username"),
                accessToken
        );
    }

    private void connectYouTube(String code, Long userId) {

        // Exchange code
        Map<String, String> body = new HashMap<>();
        body.put("client_id", googleClientId);
        //body.put("client_secret", googleClientSecret);
        body.put("code", code);
        body.put("grant_type", "authorization_code");
        //body.put("redirect_uri", googleRedirectUri);

        Map tokenResponse = restTemplate.postForObject(
                "https://oauth2.googleapis.com/token",
                body,
                Map.class
        );

        String accessToken =
                (String) tokenResponse.get("access_token");

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);

        HttpEntity entity = new HttpEntity(headers);

        ResponseEntity<Map> response =
                restTemplate.exchange(
                        "https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true",
                        HttpMethod.GET,
                        entity,
                        Map.class
                );

        Map channel =
                (Map)((List)response.getBody()
                        .get("items")).get(0);

        Map snippet =
                (Map) channel.get("snippet");

//        saveSocialAccount(
//                userId,
//                "youtube",
//                (String) channel.get("id"),
//                (String) snippet.get("title"),
//                accessToken
//        );
    }

    private void saveSocialAccount(
            Long userId,
            String platform,
            String platformUserId,
            String username,
            String accessToken
    ) {

        SocialPlatform socialPlatform =
                platform.equals("youtube")
                        ? SocialPlatform.YOUTUBE
                        : SocialPlatform.INSTAGRAM;

        Optional<SocialMediaProfile> existing =
                repository.findByPlatformAndPlatformUserId(
                        socialPlatform,
                        platformUserId
                );

        if (existing.isPresent()) {

            if (!existing.get().getUser().getId().equals(userId)) {
                throw new RuntimeException(
                        "Account already connected to another user");
            }

            existing.get().setAccessToken(accessToken);
            repository.save(existing.get());
            return;
        }

        SocialMediaProfile account = new SocialMediaProfile();

        account.setUser(authService.getUserById(userId));
        account.setPlatform(socialPlatform);
        account.setPlatformUserId(platformUserId);
        account.setUsername(username);
        account.setAccessToken(accessToken);

        repository.save(account);
    }
}

