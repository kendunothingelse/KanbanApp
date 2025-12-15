package org.example.kanban.controller;

import org.example.kanban.entity.BoardMember;
import org.example.kanban.service.BoardQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import org.example.kanban.entity.ColumnEntity;
import org.example.kanban.entity.Card;

@RestController
@RequestMapping("/boards")
@RequiredArgsConstructor
public class BoardQueryController {
    private final BoardQueryService boardQueryService;

    @GetMapping("/{boardId}/columns")
    public List<ColumnEntity> columns(@PathVariable Long boardId) {
        return boardQueryService.getColumns(boardId);
    }

    @GetMapping("/{boardId}/cards")
    public List<Card> cards(@PathVariable Long boardId) {
        return boardQueryService.getCards(boardId);
    }

    @GetMapping("/{boardId}/members")
    public List<BoardMember> members(@PathVariable Long boardId) {
        return boardQueryService.getMembers(boardId);
    }
}