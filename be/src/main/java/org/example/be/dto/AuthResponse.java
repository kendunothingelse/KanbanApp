package org.example.be.dto;

public record AuthResponse(String token, String username, String email) {
}