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

import java.util.Base64;
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
    public List<PostResponseDTO> getPosts()
    {
        return postsService.getPosts();
    }

    @GetMapping("/posts/{postId}")
    public ResponseEntity<?> getPostById(@PathVariable Long postId) {
        try {
            Posts post = postsService.getPostById(postId);

            PostResponseDTO dto = new PostResponseDTO();
            dto.setId(post.getId());
            dto.setBudget(post.getBudget());
            dto.setDeadline(post.getDeadline());
            dto.setLocation(post.getLocation());
            dto.setType(post.getType());
            dto.setTitle(post.getTitle());
            dto.setTitle(post.getTitle());
            dto.setDescription(post.getDescription());
            dto.setApplicants(post.getApplicants());
            dto.setOpenRoles(post.getOpenRoles());
            dto.setPostStatus(post.getPostStatus().name());
            dto.setPlatformsNeeded(post.getPlatformsNeeded().toArray(new String[0]));

            // Convert image to Base64
            if (post.getImageData() != null) {
                dto.setImageBase64(Base64.getEncoder().encodeToString(post.getImageData()));
            }

            // Convert applications
            List<ApplicationDTO> apps = post.getApplications()
                    .stream()
                    .map(app -> {
                        ApplicationDTO a = new ApplicationDTO();
                        a.setPostId(app.getId());
                        a.setInfluencerId(app.getInfluencer().getId());
                        a.setPitchMessage(app.getPitchMessage());
                        return a;
                    })
                    .toList();

            dto.setApplications(apps);

            return ResponseEntity.ok(dto);

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
        List<Posts> posts = postsService.getMyPosts(user);
        return ResponseEntity.ok(posts);
    }



}
