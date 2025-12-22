package org.example.be.service;

import org.example.be.entity.*;
import org.example.be.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BoardQueryService {
    private final BoardRepository boardRepo;
    private final ColumnRepository columnRepo;
    private final CardRepository cardRepo;
    private final BoardMemberRepository boardMemberRepo;

    public List<ColumnEntity> getColumns(Long boardId) {
        Board b = boardRepo.findById(boardId).orElseThrow(() -> new RuntimeException("Board not found"));
        return columnRepo.findByBoardOrderByPositionAsc(b);
    }

    public List<Card> getCards(Long boardId) {
        Board b = boardRepo.findById(boardId).orElseThrow(() -> new RuntimeException("Board not found"));
        List<ColumnEntity> cols = columnRepo.findByBoardOrderByPositionAsc(b);
        List<Card> out = new ArrayList<>();
        for (var c : cols) {
            out.addAll(cardRepo.findByColumnOrderByPositionAsc(c));
        }
        return out;
    }

    public List<BoardMember> getMembers(Long boardId) {
        Board b = boardRepo.findById(boardId).orElseThrow(() -> new RuntimeException("Board not found"));
        return boardMemberRepo.findByBoard(b);
    }
}