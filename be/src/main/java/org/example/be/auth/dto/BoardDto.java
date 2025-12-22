package org.example.be.auth.dto;

import java.time.LocalDate;

public class BoardDto {
    public record BoardCreateRequest(String name, Long workspaceId) {}
    public record BoardUpdateRequest(String name, String status, LocalDate endDate, Integer wipLimit) {}
    public record InviteRequest(Long userId, Long boardId, String role) {}
    public record CardCreateRequest(Long boardId, String title, String description,
                                    Integer position, LocalDate dueDate, String priority,
                                    String status, Double estimateHours, Double actualHours) {}
    public record MoveCardRequest(Long cardId, String targetStatus, Integer targetPosition) {}
    public record CardAssignRequest(Long cardId, Long userId) {}
    public record ChangeRoleRequest(Long userId, Long boardId, String role) {}
    public record RemoveMemberRequest(Long userId, Long boardId) {}
}