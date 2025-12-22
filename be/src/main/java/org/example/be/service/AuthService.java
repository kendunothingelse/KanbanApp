package org.example.be.service;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;


import org.example.be.auth.dto.AuthDtos;

import org.example.be.config.JwtService;
import org.example.be.entity.User;
import org.example.be.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepo;
    private final PasswordEncoder encoder;
    private final JwtService jwtService;

    public AuthDtos.AuthResponse register(@Valid AuthDtos.RegisterRequest req) {
        if (userRepo.findByUsername(req.username()).isPresent())
            throw new RuntimeException("Username exists");
        User u = User.builder()
                .username(req.username())
                .passwordHash(encoder.encode(req.password()))
                .build();
        userRepo.save(u);
        return new AuthDtos.AuthResponse(jwtService.generateToken(u.getUsername()));
    }

    public AuthDtos.AuthResponse login(AuthDtos.LoginRequest req) {
        var u = userRepo.findByUsername(req.username())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));
        if (!encoder.matches(req.password(), u.getPasswordHash()))
            throw new RuntimeException("Invalid credentials");
        return new AuthDtos.AuthResponse(jwtService.generateToken(u.getUsername()));
    }
}