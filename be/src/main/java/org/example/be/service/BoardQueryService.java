package org.example.be.service;

import lombok.RequiredArgsConstructor;
import org.example.be.entity.*;
import org.example.be.repository.*;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BoardQueryService {
    private final BoardRepository boardRepo;
    private final CardRepository cardRepo;
    private final BoardMemberRepository boardMemberRepo;
    private final CardHistoryRepository cardHistoryRepo;

    public List<Card> getCards(Long boardId) {
        Board b = boardRepo.findById(boardId).orElseThrow(() -> new RuntimeException("Board not found"));
        return cardRepo.findByBoard(b);
    }

    public List<BoardMember> getMembers(Long boardId) {
        Board b = boardRepo.findById(boardId).orElseThrow(() -> new RuntimeException("Board not found"));
        return boardMemberRepo.findByBoard(b);
    }

    public List<CardHistory> getHistory(Long boardId) {
        Board b = boardRepo.findById(boardId).orElseThrow(() -> new RuntimeException("Board not found"));
        return cardHistoryRepo.findByCard_BoardOrderByChangeDateDesc(b);
    }

    public Board getBoard(Long boardId) {
        return boardRepo.findById(boardId).orElseThrow(() -> new RuntimeException("Board not found"));
    }
}