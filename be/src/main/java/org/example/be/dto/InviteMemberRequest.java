package org.example.be.dto;

import jakarta.validation.constraints.NotNull;
import org.example.be.entity.BoardRole;

public record InviteMemberRequest(@NotNull Long userId, @NotNull BoardRole role) { }
