package org.example.be.util;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import java.security.Key;
import java.util.Date;

@Component
public class JwtUtils {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expirationMs}")
    private long jwtExpirationMs;

    Key getSigningKey() {
        // create key from secret bytes (HMAC-SHA)
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    public String generateToken(Long userId, String username, String email) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + jwtExpirationMs);
//        return Jwts.builder()
//                .setSubject(email)                // subject: email
//                .claim("username", username)      // custom claim: username
//                .setIssuedAt(now)
//                .setExpiration(expiry)
//                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
//                .compact();
        return Jwts.builder()
                .setSubject(String.valueOf(userId))      // subject = userId (stable)
                .claim("username", username)
                .claim("email", email)
                .setIssuedAt(now)
                .setExpiration(expiry)
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public boolean validateJwtToken(String token) {
        try {
            Jwts.parser().setSigningKey(getSigningKey()).build().parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            // invalid token
        }
        return false;
    }

    public Long getUserIdFromToken(String token) {
        Claims claims = Jwts.parser().setSigningKey(getSigningKey()).build()
                .parseClaimsJws(token).getBody();
        String sub = claims.getSubject(); // subject stored as userId string
        try {
            return Long.valueOf(sub);
        } catch (NumberFormatException e) {
            // backward compatibility: if subject was username or email, return null
            return null;
        }
    }

    public String getUsernameFromToken(String token) {
        Claims claims = Jwts.parser().setSigningKey(getSigningKey()).build()
                .parseClaimsJws(token).getBody();
        return claims.get("username", String.class);
    }

    public String getEmailFromToken(String token) {
        Claims claims = Jwts.parser().setSigningKey(getSigningKey()).build()
                .parseClaimsJws(token).getBody();
        return claims.get("email", String.class);
    }


}
