package org.example.be.dto;

import org.example.be.entity.BoardRole;

public record BoardMemberResponse(
        Long membershipId,
        Long userId,
        String username,
        String email,
        BoardRole role,
        String joinedAt
) {
}