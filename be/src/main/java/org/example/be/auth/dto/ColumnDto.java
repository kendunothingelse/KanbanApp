package org.example.be.auth.dto;

public class ColumnDto {
    public record ColumnCreateRequest(Long boardId, String name, Integer position) {}
    public record ColumnUpdateRequest(Long id, String name, Integer position) {}
}
