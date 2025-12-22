package org.example.be.controller;

import org.example.be.entity.BoardMember;
import org.example.be.entity.Card;
import org.example.be.entity.CardHistory;
import org.example.be.entity.Board;
import org.example.be.service.BoardQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/boards")
@RequiredArgsConstructor
public class BoardQueryController {
    private final BoardQueryService boardQueryService;

    @GetMapping("/{boardId}/cards")
    public List<Card> cards(@PathVariable Long boardId) {
        return boardQueryService.getCards(boardId);
    }

    @GetMapping("/{boardId}/members")
    public List<BoardMember> members(@PathVariable Long boardId) {
        return boardQueryService.getMembers(boardId);
    }

    @GetMapping("/{boardId}/history")
    public List<CardHistory> history(@PathVariable Long boardId) {
        return boardQueryService.getHistory(boardId);
    }

    @GetMapping("/{boardId}")
    public Board detail(@PathVariable Long boardId) {
        return boardQueryService.getBoard(boardId);
    }
}