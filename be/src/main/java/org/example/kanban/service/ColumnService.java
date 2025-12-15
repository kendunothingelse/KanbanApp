package org.example.kanban.service;

import lombok.RequiredArgsConstructor;
import org.example.kanban.auth.dto.BoardDto;
import org.example.kanban.auth.dto.ColumnDto;
import org.example.kanban.entity.Board;
import org.example.kanban.entity.ColumnEntity;
import org.example.kanban.entity.Permission;
import org.example.kanban.entity.User;
import org.example.kanban.repository.BoardRepository;
import org.example.kanban.repository.ColumnRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ColumnService {
    private final ColumnRepository columnRepo;
    private final BoardRepository boardRepo;
    private final PermissionService permissionService;

    public ColumnEntity create(BoardDto.ColumnCreateRequest req, User current) {
        Board board = boardRepo.findById(req.boardId())
                .orElseThrow(() -> new RuntimeException("Board not found"));
        permissionService.check(current, board, Permission.COLUMN_EDIT);
        ColumnEntity c = ColumnEntity.builder()
                .board(board)
                .name(req.name())
                .position(req.position())
                .build();
        return columnRepo.save(c);
    }

    @Transactional
    public ColumnEntity update(ColumnDto.ColumnUpdateRequest req, User current) {
        ColumnEntity col = columnRepo.findById(req.id())
                .orElseThrow(() -> new RuntimeException("Column not found"));
        Board board = col.getBoard();
        permissionService.check(current, board, Permission.COLUMN_EDIT);
        col.setName(req.name());
        col.setPosition(req.position());
        return columnRepo.save(col);
    }

    @Transactional
    public void delete(Long id, User current) {
        ColumnEntity col = columnRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Column not found"));
        permissionService.check(current, col.getBoard(), Permission.COLUMN_EDIT);
        columnRepo.delete(col);
    }
}