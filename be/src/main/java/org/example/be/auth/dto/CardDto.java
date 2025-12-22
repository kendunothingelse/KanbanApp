package org.example.be.auth.dto;

import java.time.LocalDate;

public class CardDto {
    public record CardUpdateRequest(Long id, String title, String description,
                                    Integer position, LocalDate dueDate, String priority,
                                    String status, Double estimateHours, Double actualHours) {
    }
    public record MoveCardRequest(Long cardId, String targetStatus, Integer targetPosition) {}
    public record CardAssignRequest(Long cardId, Long userId) {}
}