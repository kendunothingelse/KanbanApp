package org.example.be.dto;

import org.example.be.entity.BoardRole;

public record BoardMemberResponse(Long id, Long userId, String username, String email, BoardRole role,
                                  String joinedAt) {
}
