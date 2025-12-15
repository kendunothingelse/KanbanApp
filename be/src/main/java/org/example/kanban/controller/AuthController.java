package org.example.kanban.controller;


import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.example.kanban.auth.dto.AuthDtos;
import org.example.kanban.service.AuthService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/register")
    public AuthDtos.AuthResponse register(@RequestBody @Valid AuthDtos.RegisterRequest req) {
        return authService.register(req);
    }

    @PostMapping("/login")
    public AuthDtos.AuthResponse login(@RequestBody @Valid AuthDtos.LoginRequest req) {
        return authService.login(req);
    }
}
