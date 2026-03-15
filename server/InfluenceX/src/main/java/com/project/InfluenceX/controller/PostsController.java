package com.project.InfluenceX.controller;

import com.project.InfluenceX.model.*;

import com.project.InfluenceX.repository.UserRepository;
import com.project.InfluenceX.service.JwtService;
import com.project.InfluenceX.service.PostsService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.Base64;
import java.util.List;

@RestController
@CrossOrigin(origins = "https://www.influencex.online/",allowCredentials = "true")
public class PostsController {

    private final PostsService postsService;
    private final JwtService jwtService;
    private final UserRepository userRepository;

    public PostsController(PostsService postsService, JwtService jwtService, UserRepository userRepository){
        this.postsService=postsService;
        this.jwtService=jwtService;
        this.userRepository= userRepository;
    }

    @GetMapping("/posts")
    public List<PostResponseDTO> getPosts(HttpServletRequest request) {
        try {
            Cookie[] cookies = request.getCookies();
            if (cookies == null) {
                return postsService.getPostsResponse(null);
            }

            // Extract token
            String token = Arrays.stream(cookies)
                    .filter(c -> "authToken".equals(c.getName()))
                    .map(Cookie::getValue)
                    .findFirst()
                    .orElse(null);

            if (token == null) {
                return postsService.getPostsResponse(null);
            }

            // Extract email from token
            String email = jwtService.extractEmail(token);
            if (email == null) {
                return postsService.getPostsResponse(null);
            }

            User user = userRepository.findByEmail(email);
            if (user == null || !jwtService.validateToken(token, user)) {
                return postsService.getPostsResponse(null);
            }

            // Auth success
            return postsService.getPostsResponse(user);

        } catch (Exception e) {
            System.out.println("Error in /posts: " + e.getMessage());
            return postsService.getPostsResponse(null);
        }
    }


    @GetMapping("/posts/{postId}")
    public ResponseEntity<?> getPostById(@PathVariable Long postId) {
        try {
            PostResponseDTO response = postsService.getPostResponseById(postId);
            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @PostMapping(value = "/update/post/{postId}" , consumes = "multipart/form-data")
    public ResponseEntity<?> updatePost(@PathVariable Long postId,@ModelAttribute PostRequestDTO postsDTO) {
        try {
            Posts post = postsService.getPostById(postId);
            if(post==null){
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Post already deleted");
            }
            if (postsDTO == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Post data must not be null");
            }
            return postsService.updatePost(postsDTO,post);

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }



    @PostMapping(value = "/create/post" , consumes = "multipart/form-data")
    public ResponseEntity createPost(@ModelAttribute PostRequestDTO postsDTO) {
        if (postsDTO == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Post must not be null");
        }
        return postsService.createPost(postsDTO);
    }

    @GetMapping("/my-posts")
    public ResponseEntity<?> getMyPosts(HttpServletRequest request) {
        // 1️⃣ Get cookies from request
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("No cookies found");
        }

        // 2️⃣ Find authToken cookie
        String token = null;
        for (Cookie cookie : cookies) {
            if ("authToken".equals(cookie.getName())) {
                token = cookie.getValue();
                break;
            }
        }

        String email = jwtService.extractEmail(token);
        User user=userRepository.findByEmail(email);

        if (token == null || !jwtService.validateToken(token,user)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or missing token");
        }


        // 4️⃣ Fetch user’s posts
        List<PostResponseDTO> posts = postsService.getMyPosts(user);
        return ResponseEntity.ok(posts);
    }



}
