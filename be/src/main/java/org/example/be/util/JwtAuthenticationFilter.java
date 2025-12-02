package org.example.be.util;

import io.jsonwebtoken.Jwts;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import lombok.RequiredArgsConstructor;
import org.example.be.entity.User;
import org.example.be.repository.UserRepository;
import org.example.be.service.CustomUserDetailsService;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Optional;
@RequiredArgsConstructor
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtils jwtUtils;
    private final CustomUserDetailsService userDetailsService;
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            if (jwtUtils.validateJwtToken(token)) {
                // Prefer userId (subject). If present -> load by id
                Long userId = jwtUtils.getUserIdFromToken(token);
                UserDetails userDetails = null;
                if (userId != null) {
                    // load user by id via repository (you can add method userRepository.findById)
                    Optional<User> u = userRepository.findById(userId);
                    if (u.isPresent()) {
                        User user = u.get();
                        userDetails = org.springframework.security.core.userdetails.User
                                .withUsername(user.getEmail())
                                .password(user.getPassword())
                                .authorities("USER")
                                .build();
                    }
                } else {
                    // fallback: token subject wasn't numeric (legacy token) -> try claims
                    String emailFromClaim = jwtUtils.getEmailFromToken(token);
                    String usernameFromClaim = jwtUtils.getUsernameFromToken(token);
                    if (emailFromClaim != null) {
                        UserDetails ud = userDetailsService.loadUserByUsername(emailFromClaim);
                        userDetails = ud;
                    } else if (usernameFromClaim != null) {
                        UserDetails ud = userDetailsService.loadUserByUsername(usernameFromClaim);
                        userDetails = ud;
                    } else {
                        // last fallback: try subject string as identifier
                        String subject = Jwts.parser().setSigningKey(jwtUtils.getSigningKey()).build()
                                .parseClaimsJws(token).getBody().getSubject();
                        userDetails = userDetailsService.loadUserByUsername(subject);
                    }
                }

                if (userDetails != null) {
                    UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());
                    SecurityContextHolder.getContext().setAuthentication(auth);
                }
            }
        }
        chain.doFilter(request, response);
    }

}
