package org.example.be.service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import lombok.RequiredArgsConstructor;
import org.example.be.auth.dto.BoardForecastDto;
import org.example.be.entity.Board;
import org.example.be.entity.BoardMember;
import org.example.be.entity.BoardStatus;
import org.example.be.entity.Card;
import org.example.be.entity.CardHistory;
import org.example.be.entity.Status;
import org.example.be.repository.BoardMemberRepository;
import org.example.be.repository.BoardRepository;
import org.example.be.repository.CardHistoryRepository;
import org.example.be.repository.CardRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class BoardQueryService {

    private final BoardRepository boardRepo;
    private final CardRepository cardRepo;
    private final BoardMemberRepository boardMemberRepo;
    private final CardHistoryRepository cardHistoryRepo;

    public List<Card> getCards(Long boardId) {
        Board board = boardRepo.findById(boardId).orElseThrow(() -> new RuntimeException("Board not found"));
        return cardRepo.findByBoard(board);
    }

    public List<BoardMember> getMembers(Long boardId) {
        Board board = boardRepo.findById(boardId).orElseThrow(() -> new RuntimeException("Board not found"));
        return boardMemberRepo.findByBoard(board);
    }

    /**
     * Trả về lịch sử được sắp xếp theo thời gian: mới nhất lên trên.
     * Sử dụng query tối ưu từ repository và thêm sort Java để đảm bảo chính xác.
     */
    public List<CardHistory> getHistory(Long boardId) {
        Board board = boardRepo.findById(boardId).orElseThrow(() -> new RuntimeException("Board not found"));

        List<CardHistory> histories = cardHistoryRepo.findByBoardOrderByChangeDateDescIdDesc(board);

        histories.sort((first, second) -> {
            int dateCompare = second.getChangeDate().compareTo(first.getChangeDate());
            if (dateCompare != 0) {
                return dateCompare;
            }
            Long firstId = first.getId() != null ? first.getId() : Long.MIN_VALUE;
            Long secondId = second.getId() != null ? second.getId() : Long.MIN_VALUE;
            return Long.compare(secondId, firstId);
        });

        return histories;
    }

    public Board getBoard(Long boardId) {
        return boardRepo.findById(boardId).orElseThrow(() -> new RuntimeException("Board not found"));
    }

    //Lấy thống kê số task DONE và tổng số task của board
    public Map<String, Integer> getBoardProgress(Long boardId) {
        Board board = boardRepo.findById(boardId).orElseThrow(() -> new RuntimeException("Board not found"));
        List<Card> cards = cardRepo.findByBoard(board);

        int total = cards.size();
        int doneCount = (int) cards.stream().filter(card -> card.getStatus() == Status.DONE).count();

        Map<String, Integer> result = new HashMap<>();
        result.put("total", total);
        result.put("done", doneCount);
        return result;
    }

    //Kiểm tra và tự động cập nhật trạng thái board nếu tất cả task đều DONE
    @Transactional
    public Board checkAndUpdateBoardStatus(Long boardId) {
        Board board = boardRepo.findById(boardId).orElseThrow(() -> new RuntimeException("Board not found"));
        List<Card> cards = cardRepo.findByBoard(board);

        if (cards.isEmpty()) {
            return board;
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

        return board;
    }

    public BoardForecastDto forecast(Long boardId) {
        Board board = boardRepo.findById(boardId).orElseThrow(() -> new RuntimeException("Board not found"));
        List<Card> cards = cardRepo.findByBoard(board);
        List<CardHistory> histories = cardHistoryRepo.findByBoardOrderByChangeDateDescIdDesc(board);

        Map<Long, LocalDateTime> earliestDoneByCard = new HashMap<>();
        for (CardHistory history : histories) {
            if (history.getToStatus() == Status.DONE) {
                Long cardId = history.getCard().getId();
                earliestDoneByCard.merge(
                        cardId,
                        history.getChangeDate(),
                        (oldValue, newValue) -> newValue.isBefore(oldValue) ? newValue : oldValue
                );
            }
        }

        List<Double> cycleTimes = new ArrayList<>();
        int doneCount = 0;

        for (Card card : cards) {
            if (card.getStatus() == Status.DONE) {
                doneCount++;
                LocalDateTime createdAt = card.getCreatedAt();
                LocalDateTime doneAt = earliestDoneByCard.get(card.getId());
                if (createdAt != null && doneAt != null) {
                    double days = Math.max(0, Duration.between(createdAt, doneAt).toMillis() / 86_400_000d);
                    cycleTimes.add(days);
                }
            }
        }

        double avgCycle = cycleTimes.isEmpty()
                ? 0
                : cycleTimes.stream().mapToDouble(Double::doubleValue).average().orElse(0);

        double avgActualHours = cards.stream()
                .filter(card -> card.getStatus() == Status.DONE && card.getActualHours() != null)
                .mapToDouble(Card::getActualHours)
                .average()
                .orElse(0);

        int total = cards.size();
        int remaining = total - doneCount;
        double remainingTimeDays = remaining * avgCycle;
        double remainingEffortHours = remaining * avgActualHours;

        LocalDate estimatedEndDate = remainingTimeDays > 0
                ? LocalDate.now().plusDays((long) Math.ceil(remainingTimeDays))
                : null;

        return new BoardForecastDto(
                avgCycle,
                avgActualHours,
                total,
                doneCount,
                remaining,
                remainingTimeDays,
                remainingEffortHours,
                estimatedEndDate
        );
    }
}