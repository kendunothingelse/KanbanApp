package org.example.be.auth.dto;

import java.time.LocalDate;

public class CardDto {
    public record CardCreateRequest(Long columnId, String title, String description,
                                    Integer position, LocalDate dueDate, String priority) {
    }

    public record CardUpdateRequest(Long id, String title, String description,
                                    Integer position, LocalDate dueDate, String priority) {
    }

    public record MoveCardRequest(Long cardId, Long targetColumnId, Integer targetPosition) {
    }

    public record CardAssignRequest(Long cardId, Long userId) {
    }
}
