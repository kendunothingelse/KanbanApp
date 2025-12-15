package org.example.kanban.service;

import lombok.RequiredArgsConstructor;
import org.example.kanban.auth.dto.BoardDto;
import org.example.kanban.entity.*;
import org.example.kanban.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CardService {
    private final CardRepository cardRepo;
    private final ColumnRepository columnRepo;
    private final BoardRepository boardRepo;
    private final PermissionService permissionService;
    private final UserRepository userRepo;
    private final CardAssigneeRepository cardAssigneeRepo;

    @Transactional
    public Card create(BoardDto.CardCreateRequest req, User current) {
        ColumnEntity col = columnRepo.findById(req.columnId())
                .orElseThrow(() -> new RuntimeException("Column not found"));
        Board board = col.getBoard();
        permissionService.check(current, board, Permission.CARD_EDIT);
        Card card = Card.builder()
                .column(col)
                .title(req.title())
                .description(req.description())
                .position(req.position())
                .build();
        return cardRepo.save(card);
    }

    @Transactional
    public Card move(BoardDto.MoveCardRequest req, User current) {
        Card card = cardRepo.findById(req.cardId())
                .orElseThrow(() -> new RuntimeException("Card not found"));
        ColumnEntity targetCol = columnRepo.findById(req.targetColumnId())
                .orElseThrow(() -> new RuntimeException("Target column not found"));

        Board board = card.getColumn().getBoard();
        permissionService.check(current, board, Permission.CARD_EDIT);

        // update column & position
        card.setColumn(targetCol);
        card.setPosition(req.targetPosition());
        Card saved = cardRepo.save(card);

        // reorder (simple: not stable, demo only)
        var cards = cardRepo.findByColumnOrderByPositionAsc(targetCol);
        int pos = 0;
        for (Card c : cards) {
            c.setPosition(pos++);
        }
        cardRepo.saveAll(cards);
        return saved;
    }

    @Transactional
    public void assign(BoardDto.CardAssignRequest req, User current) {
        Card card = cardRepo.findById(req.cardId())
                .orElseThrow(() -> new RuntimeException("Card not found"));
        Board board = card.getColumn().getBoard();
        permissionService.check(current, board, Permission.CARD_EDIT);
        User u = userRepo.findById(req.userId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (!cardAssigneeRepo.existsByCardAndUser(card, u)) {
            cardAssigneeRepo.save(CardAssignee.builder().card(card).user(u).build());
        }
    }
}