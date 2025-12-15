package org.example.kanban.service;

import org.example.kanban.auth.dto.*;
import org.example.kanban.entity.*;
import org.example.kanban.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;

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
                .dueDate(req.dueDate())
                .priority(req.priority() == null ? null : Priority.valueOf(req.priority()))
                .build();
        return cardRepo.save(card);
    }

    @Transactional
    public Card update(CardDto.CardUpdateRequest req, User current) {
        Card card = cardRepo.findById(req.id())
                .orElseThrow(() -> new RuntimeException("Card not found"));
        Board board = card.getColumn().getBoard();
        permissionService.check(current, board, Permission.CARD_EDIT);

        card.setTitle(req.title());
        card.setDescription(req.description());
        card.setPosition(req.position());
        card.setDueDate(req.dueDate());
        card.setPriority(req.priority() == null ? null : Priority.valueOf(req.priority()));
        return cardRepo.save(card);
    }

    @Transactional
    public void delete(Long id, User current) {
        Card card = cardRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Card not found"));
        permissionService.check(current, card.getColumn().getBoard(), Permission.CARD_EDIT);
        cardRepo.delete(card);
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

    @Transactional
    public Card move(BoardDto.MoveCardRequest req, User current) {
        Card card = cardRepo.findById(req.cardId())
                .orElseThrow(() -> new RuntimeException("Card not found"));
        ColumnEntity targetCol = columnRepo.findById(req.targetColumnId())
                .orElseThrow(() -> new RuntimeException("Target column not found"));

        Board board = card.getColumn().getBoard();
        permissionService.check(current, board, Permission.CARD_EDIT);

        // move card
        card.setColumn(targetCol);
        card.setPosition(req.targetPosition());
        cardRepo.save(card);

        // reorder batch to avoid duplicate positions
        var cards = cardRepo.findByColumnOrderByPositionAsc(targetCol);
        cards.sort(Comparator.comparing(Card::getPosition, Comparator.nullsLast(Integer::compareTo)));
        int pos = 0;
        for (Card c : cards) c.setPosition(pos++);
        cardRepo.saveAll(cards);
        return card;
    }
}