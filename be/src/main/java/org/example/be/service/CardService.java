package org.example.be.service;

import java.time.LocalDateTime;
import java.util.Comparator;

import lombok.RequiredArgsConstructor;
import org.example.be.auth.dto.BoardDto;
import org.example.be.auth.dto.CardDto;
import org.example.be.entity.*;
import org.example.be.repository.BoardRepository;
import org.example.be.repository.CardAssigneeRepository;
import org.example.be.repository.CardHistoryRepository;
import org.example.be.repository.CardRepository;
import org.example.be.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
        Integer wipLimit = board.getWipLimit();
        if (wipLimit == null || wipLimit <= 0) {
            return;
        }
        int inProgress = cardRepo.findByBoardAndStatusOrderByPositionAsc(board, Status.IN_PROGRESS).size();
        if (inProgress >= wipLimit) {
            throw new RuntimeException("WIP limit reached for IN_PROGRESS");
        }
    }

    //Kiểm tra và tự động cập nhật trạng thái board
    private void checkAndUpdateBoardStatus(Board board) {
        var cards = cardRepo.findByBoard(board);
        if (cards.isEmpty()) {
            return;
        }

        int total = cards.size();
        int doneCount = (int) cards.stream().filter(card -> card.getStatus() == Status.DONE).count();

        if (doneCount == total && board.getStatus() != BoardStatus.DONE) {
            board.setStatus(BoardStatus.DONE);
            boardRepo.save(board);
        } else if (doneCount < total && board.getStatus() == BoardStatus.DONE) {
            board.setStatus(BoardStatus.IN_PROGRESS);
            boardRepo.save(board);
        }
    }

    @Transactional
    public Card create(BoardDto.CardCreateRequest req, User currentUser) {
        Board board = boardRepo.findById(req.boardId())
                .orElseThrow(() -> new RuntimeException("Board not found"));
        permissionService.check(currentUser, board, Permission.CARD_EDIT);

        Status status = Status.valueOf(req.status() == null ? "TODO" : req.status());
        if (status == Status.IN_PROGRESS) {
            enforceWipLimit(board);
        }

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
        Card savedCard = cardRepo.save(card);

        checkAndUpdateBoardStatus(board);

        return savedCard;
    }

    @Transactional
    public Card update(CardDto.CardUpdateRequest req, User currentUser) {
        Card card = cardRepo.findById(req.id())
                .orElseThrow(() -> new RuntimeException("Card not found"));
        Board board = card.getBoard();
        permissionService.check(currentUser, board, Permission.CARD_EDIT);

        Status previousStatus = card.getStatus();
        if (req.status() != null) {
            Status newStatus = Status.valueOf(req.status());
            if (newStatus == Status.IN_PROGRESS && previousStatus != Status.IN_PROGRESS) {
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

        Card savedCard = cardRepo.save(card);

        if (req.status() != null && previousStatus != savedCard.getStatus()) {
            cardHistoryRepo.save(
                    CardHistory.builder()
                            .card(savedCard)
                            .fromStatus(previousStatus)
                            .toStatus(savedCard.getStatus())
                            .changeDate(LocalDateTime.now())
                            .actor(currentUser)
                            .build()
            );
        }

        checkAndUpdateBoardStatus(board);


        return savedCard;
    }

    @Transactional
    public void delete(Long id, User currentUser) {
        Card card = cardRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Card not found"));
        Board board = card.getBoard();
        permissionService.check(currentUser, board, Permission.CARD_EDIT);
        cardRepo.delete(card);

        checkAndUpdateBoardStatus(board);
    }

    @Transactional
    public void assign(BoardDto.CardAssignRequest req, User currentUser) {
        Card card = cardRepo.findById(req.cardId())
                .orElseThrow(() -> new RuntimeException("Card not found"));
        Board board = card.getBoard();
        permissionService.check(currentUser, board, Permission.CARD_EDIT);

        User assignee = userRepo.findById(req.userId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (!cardAssigneeRepo.existsByCardAndUser(card, assignee)) {
            cardAssigneeRepo.save(CardAssignee.builder().card(card).user(assignee).build());
        }
    }

    @Transactional
    public Card move(BoardDto.MoveCardRequest req, User currentUser) {
        Card card = cardRepo.findById(req.cardId())
                .orElseThrow(() -> new RuntimeException("Card not found"));
        Board board = card.getBoard();
        permissionService.check(currentUser, board, Permission.CARD_EDIT);

        Status previousStatus = card.getStatus();
        Status targetStatus = Status.valueOf(req.targetStatus());

        if (targetStatus == Status.IN_PROGRESS && previousStatus != Status.IN_PROGRESS) {
            enforceWipLimit(board);
        }

        card.setStatus(targetStatus);
        card.setPosition(req.targetPosition());
        cardRepo.save(card);

        var cards = cardRepo.findByBoardAndStatusOrderByPositionAsc(board, targetStatus);
        cards.sort(Comparator.comparing(Card::getPosition, Comparator.nullsLast(Integer::compareTo)));
        int position = 0;
        for (Card c : cards) {
            c.setPosition(position++);
        }
        cardRepo.saveAll(cards);

        if (previousStatus != targetStatus) {
            cardHistoryRepo.save(
                    CardHistory.builder()
                            .card(card)
                            .fromStatus(previousStatus)
                            .toStatus(targetStatus)
                            .changeDate(LocalDateTime.now())
                            .actor(currentUser)
                            .build()
            );
        }

        checkAndUpdateBoardStatus(board);

        return card;
    }
}