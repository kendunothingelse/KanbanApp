package org.example.be.auth.dto;

import jakarta.validation.constraints.NotBlank;

public class WorkspaceDtos {
    public record WorkspaceCreateRequest(
            @NotBlank String name
    ) {
    }

    public record WorkspaceUpdateRequest(
            @NotBlank String name
    ) {
    }
}
