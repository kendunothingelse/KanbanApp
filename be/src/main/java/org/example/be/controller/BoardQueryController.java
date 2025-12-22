package org.example.be.controller;

import org.example.be.entity.BoardMember;
import org.example.be.service.BoardQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import org.example.be.entity.ColumnEntity;
import org.example.be.entity.Card;

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