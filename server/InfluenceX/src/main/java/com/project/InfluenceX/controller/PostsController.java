package com.project.InfluenceX.controller;

import com.project.InfluenceX.model.MyPostsDTO;
import com.project.InfluenceX.model.Posts;
import com.project.InfluenceX.model.PostsDTO;
import com.project.InfluenceX.model.User;

import com.project.InfluenceX.repository.UserRepository;
import com.project.InfluenceX.service.JwtService;
import com.project.InfluenceX.service.PostsService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:5173",allowCredentials = "true")
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
    public List<Posts> getPosts()
    {
        return postsService.getPosts();
    }

    @GetMapping("/posts/{postId}")
    public ResponseEntity<?> getPostById(@PathVariable Long postId) {
        try {
            Posts post = postsService.getPostById(postId);
            return ResponseEntity.ok(post);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }


    @PostMapping("/create/post")
    public ResponseEntity createPost(@ModelAttribute PostsDTO postsDTO) {
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
        List<Posts> posts = postsService.getMyPosts(user);
        return ResponseEntity.ok(posts);
    }



}
