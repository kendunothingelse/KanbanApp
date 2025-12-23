package org.example.be.service;

import lombok.RequiredArgsConstructor;
import org.example.be. auth.dto.BoardForecastDto;
import org. example.be.entity.*;
import org.example.be.repository.*;
import org.springframework.stereotype.Service;
import org.springframework. transaction.annotation. Transactional;

import java.time. Duration;
import java. time.LocalDate;
import java. time.LocalDateTime;
import java.util.*;

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
        Board b = boardRepo. findById(boardId).orElseThrow(() -> new RuntimeException("Board not found"));
        return boardMemberRepo.findByBoard(b);
    }

    /**
     * Trả về lịch sử được sắp xếp theo thời gian:  mới nhất lên trên.
     * Sử dụng query tối ưu từ repository và thêm sort Java để đảm bảo chính xác.
     */
    public List<CardHistory> getHistory(Long boardId) {
        Board b = boardRepo.findById(boardId).orElseThrow(() -> new RuntimeException("Board not found"));

        // Sử dụng query mới với ORDER BY rõ ràng
        List<CardHistory> histories = cardHistoryRepo. findByBoardOrderByChangeDateDescIdDesc(b);

        // Đảm bảo sort thêm một lần nữa ở Java để chắc chắn kết quả đúng
        // Sort theo changeDate DESC, nếu trùng thì theo id DESC
        histories.sort((h1, h2) -> {
            // So sánh changeDate trước (giảm dần - mới nhất lên trên)
            int dateCompare = h2.getChangeDate().compareTo(h1.getChangeDate());
            if (dateCompare != 0) {
                return dateCompare;
            }
            // Nếu changeDate giống nhau, so sánh id (giảm dần)
            Long id1 = h1.getId() != null ? h1.getId() : Long.MIN_VALUE;
            Long id2 = h2.getId() != null ? h2.getId() : Long.MIN_VALUE;
            return Long.compare(id2, id1);
        });

        return histories;
    }

    public Board getBoard(Long boardId) {
        return boardRepo.findById(boardId).orElseThrow(() -> new RuntimeException("Board not found"));
    }

    // [NEW] Lấy thống kê số task DONE và tổng số task của board
    public Map<String, Integer> getBoardProgress(Long boardId) {
        Board b = boardRepo.findById(boardId).orElseThrow(() -> new RuntimeException("Board not found"));
        List<Card> cards = cardRepo.findByBoard(b);

        int total = cards.size();
        int doneCount = (int) cards.stream().filter(c -> c.getStatus() == Status.DONE).count();

        Map<String, Integer> result = new HashMap<>();
        result.put("total", total);
        result.put("done", doneCount);
        return result;
    }

    // [NEW] Kiểm tra và tự động cập nhật trạng thái board nếu tất cả task đều DONE
    @Transactional
    public Board checkAndUpdateBoardStatus(Long boardId) {
        Board b = boardRepo.findById(boardId).orElseThrow(() -> new RuntimeException("Board not found"));
        List<Card> cards = cardRepo.findByBoard(b);

        // Nếu không có task nào, không tự động chuyển
        if (cards. isEmpty()) {
            return b;
        }

        int total = cards.size();
        int doneCount = (int) cards.stream().filter(c -> c. getStatus() == Status.DONE).count();

        // Nếu tất cả task đều DONE và board chưa DONE -> tự động chuyển
        if (doneCount == total && b.getStatus() != BoardStatus.DONE) {
            b. setStatus(BoardStatus.DONE);
            boardRepo.save(b);
        }
        // Nếu có task chưa DONE nhưng board đang DONE -> chuyển lại IN_PROGRESS
        else if (doneCount < total && b. getStatus() == BoardStatus.DONE) {
            b. setStatus(BoardStatus.IN_PROGRESS);
            boardRepo.save(b);
        }

        return b;
    }

    public BoardForecastDto forecast(Long boardId) {
        Board board = boardRepo.findById(boardId).orElseThrow(() -> new RuntimeException("Board not found"));
        List<Card> cards = cardRepo.findByBoard(board);
        List<CardHistory> histories = cardHistoryRepo.findByBoardOrderByChangeDateDescIdDesc(board);

        // earliest DONE per card
        Map<Long, LocalDateTime> earliestDone = new HashMap<>();
        for (CardHistory h : histories) {
            if (h. getToStatus() == Status.DONE) {
                Long cardId = h. getCard().getId();
                earliestDone.merge(cardId, h.getChangeDate(), (oldV, newV) -> newV. isBefore(oldV) ? newV : oldV);
            }
        }

        List<Double> cycleTimes = new ArrayList<>();
        int doneCount = 0;

        for (Card c : cards) {
            if (c. getStatus() == Status.DONE) {
                doneCount++;
                LocalDateTime createdAt = c. getCreatedAt();
                LocalDateTime doneAt = earliestDone.get(c.getId());
                if (createdAt != null && doneAt != null) {
                    double days = Math.max(0,
                            Duration.between(createdAt, doneAt).toMillis() / 86_400_000d);
                    cycleTimes.add(days);
                }
            }
        }

        double avgCycle = cycleTimes.isEmpty()
                ? 0
                : cycleTimes.stream().mapToDouble(Double::doubleValue).average().orElse(0);

        double avgActualHours = cards.stream()
                .filter(c -> c.getStatus() == Status.DONE && c.getActualHours() != null)
                .mapToDouble(Card::getActualHours)
                .average()
                .orElse(0);

        int total = cards.size();
        int remaining = total - doneCount;
        double remainingTimeDays = remaining * avgCycle;
        double remainingEffortHours = remaining * avgActualHours;

        LocalDate estimatedEndDate = remainingTimeDays > 0
                ? LocalDate. now().plusDays((long) Math.ceil(remainingTimeDays))
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