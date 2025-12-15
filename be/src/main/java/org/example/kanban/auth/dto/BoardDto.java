package org.example.kanban.auth.dto;

public class BoardDto {
    public record BoardCreateRequest(String name, Long workspaceId) {}
    public record InviteRequest(Long userId, Long boardId, String role) {}
    public record ColumnCreateRequest(Long boardId, String name, Integer position) {}
    public record CardCreateRequest(Long columnId, String title, String description, Integer position) {}
    public record MoveCardRequest(Long cardId, Long targetColumnId, Integer targetPosition) {}
    public record CardAssignRequest(Long cardId, Long userId) {}
}
