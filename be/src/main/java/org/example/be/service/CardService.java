package org.example.be.service;

import lombok.RequiredArgsConstructor;
import org.example.be.auth.dto.BoardDto;
import org.example.be.auth.dto.CardDto;
import org.example.be.entity.*;
import org.example.be.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;

@Service
@RequiredArgsConstructor
public class CardService {
    private final CardRepository cardRepo;
    private final BoardRepository boardRepo;
    private final PermissionService permissionService;
    private final UserRepository userRepo;
    private final CardAssigneeRepository cardAssigneeRepo;
    private final CardHistoryRepository cardHistoryRepo;

    private void enforceWipLimit(Board board) {
        Integer wip = board.getWipLimit();
        if (wip == null || wip <= 0) return;
        int inProgress = cardRepo.findByBoardAndStatusOrderByPositionAsc(board, Status.IN_PROGRESS).size();
        if (inProgress >= wip) {
            throw new RuntimeException("WIP limit reached for IN_PROGRESS");
        }
    }

    @Transactional
    public Card create(BoardDto.CardCreateRequest req, User current) {
        Board board = boardRepo.findById(req.boardId())
                .orElseThrow(() -> new RuntimeException("Board not found"));
        permissionService.check(current, board, Permission.CARD_EDIT);

        Status status = Status.valueOf(req.status() == null ? "TODO" : req.status());
        if (status == Status.IN_PROGRESS) enforceWipLimit(board);

        Card card = Card.builder()
                .board(board)
                .status(status)
                .title(req.title())
                .description(req.description())
                .position(req.position())
                .dueDate(req.dueDate())
                .priority(req.priority() == null ? null : Priority.valueOf(req.priority()))
                .estimateHours(req.estimateHours())
                .actualHours(req.actualHours())
                .build();
        return cardRepo.save(card);
    }

    @Transactional
    public Card update(CardDto.CardUpdateRequest req, User current) {
        Card card = cardRepo.findById(req.id())
                .orElseThrow(() -> new RuntimeException("Card not found"));
        Board board = card.getBoard();
        permissionService.check(current, board, Permission.CARD_EDIT);

        Status oldStatus = card.getStatus();
        if (req.status() != null) {
            Status newStatus = Status.valueOf(req.status());
            if (newStatus == Status.IN_PROGRESS && oldStatus != Status.IN_PROGRESS) {
                enforceWipLimit(board);
            }
            card.setStatus(newStatus);
        }

        card.setTitle(req.title());
        card.setDescription(req.description());
        card.setPosition(req.position());
        card.setDueDate(req.dueDate());
        card.setPriority(req.priority() == null ? null : Priority.valueOf(req.priority()));
        card.setEstimateHours(req.estimateHours());
        card.setActualHours(req.actualHours());

        Card saved = cardRepo.save(card);

        // record history on status change
        if (req.status() != null && oldStatus != saved.getStatus()) {
            cardHistoryRepo.save(CardHistory.builder()
                    .card(saved)
                    .fromStatus(oldStatus)
                    .toStatus(saved.getStatus())
                    .changeDate(LocalDateTime.now())
                    .build());
        }
        return saved;
    }

    @Transactional
    public void delete(Long id, User current) {
        Card card = cardRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Card not found"));
        permissionService.check(current, card.getBoard(), Permission.CARD_EDIT);
        cardRepo.delete(card);
    }

    @Transactional
    public void assign(BoardDto.CardAssignRequest req, User current) {
        Card card = cardRepo.findById(req.cardId())
                .orElseThrow(() -> new RuntimeException("Card not found"));
        Board board = card.getBoard();
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
        Board board = card.getBoard();
        permissionService.check(current, board, Permission.CARD_EDIT);

        Status oldStatus = card.getStatus();
        Status targetStatus = Status.valueOf(req.targetStatus());

        if (targetStatus == Status.IN_PROGRESS && oldStatus != Status.IN_PROGRESS) {
            enforceWipLimit(board);
        }

        card.setStatus(targetStatus);
        card.setPosition(req.targetPosition());
        cardRepo.save(card);

        // reorder positions in target status
        var cards = cardRepo.findByBoardAndStatusOrderByPositionAsc(board, targetStatus);
        cards.sort(Comparator.comparing(Card::getPosition, Comparator.nullsLast(Integer::compareTo)));
        int pos = 0;
        for (Card c : cards) c.setPosition(pos++);
        cardRepo.saveAll(cards);

        // record history when status changes
        if (oldStatus != targetStatus) {
            cardHistoryRepo.save(CardHistory.builder()
                    .card(card)
                    .fromStatus(oldStatus)
                    .toStatus(targetStatus)
                    .changeDate(LocalDateTime.now())
                    .build());
        }
        return card;
    }
}