package com.project.InfluenceX.service;

import com.project.InfluenceX.model.User;
import com.project.InfluenceX.repository.UserRepository;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Service;

import java.util.Arrays;

@Service
public class AuthService {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    public AuthService(JwtService jwtService, UserRepository userRepository) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    public User getUser(HttpServletRequest request) {

        Cookie[] cookies = request.getCookies();
        if (cookies == null) return null;

        String token = Arrays.stream(cookies)
                .filter(c -> "authToken".equals(c.getName()))
                .map(Cookie::getValue)
                .findFirst()
                .orElse(null);

        if (token == null) return null;

        String email = jwtService.extractEmail(token);
        if (email == null) return null;

        User user = userRepository.findByEmail(email);

        if (user == null || !jwtService.validateToken(token, user)) return null;

        return user;
    }
}
