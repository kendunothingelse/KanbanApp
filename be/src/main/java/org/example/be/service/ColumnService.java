package org.example.be.service;

import lombok.RequiredArgsConstructor;
import org.example.be.auth.dto.BoardDto;
import org.example.be.auth.dto.ColumnDto;
import org.example.be.entity.Board;
import org.example.be.entity.ColumnEntity;
import org.example.be.entity.Permission;
import org.example.be.entity.User;
import org.example.be.repository.BoardRepository;
import org.example.be.repository.ColumnRepository;
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