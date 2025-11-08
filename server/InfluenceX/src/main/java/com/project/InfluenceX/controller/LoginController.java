package com.project.InfluenceX.controller;

import com.project.InfluenceX.model.LoginDTO;
import com.project.InfluenceX.model.User;
import com.project.InfluenceX.service.JwtService;
import com.project.InfluenceX.service.UserService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class LoginController {

    private final UserService userService;
    private final JwtService jwtService;

    public LoginController(UserService userService, JwtService jwtService) {
        this.userService = userService;
        this.jwtService = jwtService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginDTO loginRequest, HttpServletResponse response) {
        // Step 1: Check if the email/password is valid
        User user = userService.authenticateUser(loginRequest.getEmail(), loginRequest.getPassword());
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        }

        // Step 2: User is authenticated, generate a JWT token for them
        String token = jwtService.generateToken(user);

        // Step 3: Send the token as a HttpOnly cookie (safe from JS)
        ResponseCookie cookie = ResponseCookie.from("authToken", token)
                .httpOnly(true)      // prevents access from JavaScript (protects against XSS)
                .secure(false)       // use true in production when using HTTPS
                .path("/")           // cookie valid for the entire site
                .sameSite("Strict")  // prevents sending cookie in cross-site requests
                .maxAge(15 * 60)     // 15 minutes
                .build();

        // Step 4: Add the cookie to the response
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        // Step 5: Return a friendly message (frontend can also call /whoAmI to get user info)
        return ResponseEntity.ok("Login successful");
    }

    @GetMapping("/whoAmI")
    public ResponseEntity<?> whoAmI(HttpServletRequest request) {
        // Step 1: Read all cookies from the request
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("No cookies found");
        }

        // Step 2: Look for the authToken cookie
        String token = null;
        for (Cookie cookie : cookies) {
            if ("authToken".equals(cookie.getName())) {
                token = cookie.getValue();
                break;
            }
        }

        // Step 3: Extract user email from the JWT and fetch user info
        String email = jwtService.extractEmail(token);
        User user = userService.getUserByEmail(email);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }

        if (token == null || !jwtService.validateToken(token,user)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or missing token");
        }


        // Step 4: Hide password before sending to frontend
        user.setPassword(null);

        return ResponseEntity.ok(user);
    }
}
