package org.example.be.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.be.dto.AuthResponse;
import org.example.be.dto.LoginRequest;
import org.example.be.dto.RegisterRequest;
import org.example.be.entity.User;
import org.example.be.repository.UserRepository;
import org.example.be.util.JwtUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class UserAuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final AuthenticationManager authenticationManager;


    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest req) {
        if (userRepository.existsByEmail(req.email())) {
            return ResponseEntity.badRequest().body("Email already used");
        }
        if (userRepository.existsByUsername(req.username())) {
            return ResponseEntity.badRequest().body("Username already used");
        }
        User user = new User();
        user.setUsername(req.username());
        user.setEmail(req.email());
        user.setPassword(passwordEncoder.encode(req.password())); // hash password
        userRepository.save(user);
        return ResponseEntity.ok("User registered");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req) {
        String idf = req.identifier().trim();
        try {
            // authenticate by passing identifier as principal to AuthenticationManager
            Authentication auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(idf, req.password())
            );

            // after successful authentication, load user from repository:
            // try find by email first, then username; or use one repository method
            Optional<User> optUser = userRepository.findByEmail(idf);
            if (optUser.isEmpty()) {
                optUser = userRepository.findByUsername(idf);
            }
            if (optUser.isEmpty()) {
                return ResponseEntity.status(401).body("User not found after authentication");
            }
            User user = optUser.get();

            // generate token using user id as subject, but include username & email as claims
            String token = jwtUtils.generateToken(user.getId(), user.getUsername(), user.getEmail());
            return ResponseEntity.ok(new AuthResponse(token, user.getUsername(), user.getEmail()));
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(401).body("Invalid credentials");
        }
    }


    // example protected endpoint to fetch current user info
    @GetMapping("/me")
    public ResponseEntity<?> me(Authentication authentication) {
        // authentication is injected by Spring Security (from JwtAuthenticationFilter)
        if (authentication == null) return ResponseEntity.status(401).build();
        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        return ResponseEntity.ok(new AuthResponse("N/A", user.getUsername(), user.getEmail()));
    }

    @GetMapping("/users/search")
    public ResponseEntity<List<AuthResponse>> searchUsers(@RequestParam("q") String query) {
        String q = query.trim();
        if (q.isEmpty()) {
            return ResponseEntity.ok(List.of());
        }

        // Basic example: search by username OR email containing q (you must add these finders in UserRepository)
        List<User> users = userRepository.findTop20ByUsernameContainingIgnoreCaseOrEmailContainingIgnoreCase(q, q);

        List<AuthResponse> result = users.stream()
                .map(u -> new AuthResponse("N/A", u.getUsername(), u.getEmail()))
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }
}
