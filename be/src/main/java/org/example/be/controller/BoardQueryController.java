package org.example.be.controller;

import org.example.be.auth.dto.BoardForecastDto;
import org.example.be.entity.BoardMember;
import org.example.be.entity.Card;
import org.example.be.entity.CardHistory;
import org.example.be.entity.Board;
import org.example.be.service.BoardQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

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

    @GetMapping("/{boardId}/forecast")
    public BoardForecastDto forecast(@PathVariable Long boardId) {
        return boardQueryService.forecast(boardId);
    }

    // [NEW] API lấy progress của board (số task done / tổng)
    @GetMapping("/{boardId}/progress")
    public Map<String, Integer> progress(@PathVariable Long boardId) {
        return boardQueryService.getBoardProgress(boardId);
    }

    // [NEW] API kiểm tra và tự động cập nhật trạng thái board
    @PostMapping("/{boardId}/check-status")
    public Board checkAndUpdateStatus(@PathVariable Long boardId) {
        return boardQueryService.checkAndUpdateBoardStatus(boardId);
    }
}