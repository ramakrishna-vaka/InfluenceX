package com.project.InfluenceX.service;

import com.project.InfluenceX.model.User;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;

@Service
public class JwtService {

    // Secret key used to sign JWT tokens (keep this safe in env variables for production)
    private final SecretKey SECRET_KEY = Keys.secretKeyFor(SignatureAlgorithm.HS256);


    /**
     * Generate a JWT token for a user.
     * Includes user ID, name, and email as claims.
     * Token expires in 15 minutes.
     */
    public String generateToken(User user) {
        return Jwts.builder()
                .setSubject(user.getEmail())  // primary identifier
                .claim("name", user.getName()) // store user's name
                .claim("id", user.getId())     // store user's id
                .setIssuedAt(new Date())       // issued now
                .setExpiration(new Date(System.currentTimeMillis() + 15 * 60 * 1000)) // 15 min expiry
                .signWith(SignatureAlgorithm.HS256, SECRET_KEY) // sign with secret key
                .compact();
    }

    /**
     * Extract all claims (email, id, name, etc.) from a token.
     */
    public Claims extractAllClaims(String token) {
        return Jwts.parser()
                .setSigningKey(SECRET_KEY)
                .parseClaimsJws(token)
                .getBody();
    }

    /**
     * Validate token: checks if email matches and token is not expired.
     */
    public boolean validateToken(String token, User user) {
        String email = extractAllClaims(token).getSubject();
        return email.equals(user.getEmail()) && !isTokenExpired(token);
    }

    /**
     * Check if token has expired.
     */
    private boolean isTokenExpired(String token) {
        return extractAllClaims(token).getExpiration().before(new Date());
    }

    /**
     * Extract email from the token (simplifies /whoAmI endpoint)
     */
    public String extractEmail(String token) {
        return extractAllClaims(token).getSubject();
    }
}
