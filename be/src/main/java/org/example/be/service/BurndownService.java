package org.example.be.service;

import lombok.RequiredArgsConstructor;
import org.example.be.auth.dto.BurndownDto;
import org.example.be.auth.dto.BurndownDto.BurndownResponse;
import org.example.be.auth.dto.BurndownDto.BurndownPoint;
import org.example.be.auth.dto.BurndownDto.WeeklyVelocity;
import org.example.be.entity.Board;
import org.example.be.entity.Card;
import org.example.be.entity.CardHistory;
import org.example.be.entity.DailySnapshot;
import org.example.be.entity.Status;
import org.example.be.repository.BoardRepository;
import org.example.be.repository.CardHistoryRepository;
import org.example.be.repository.CardRepository;
import org.example.be.repository.DailySnapshotRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.stream.Collectors;


/**
 * Service xử lý logic tính toán Burndown Chart và Velocity Tracking.
 * Áp dụng các phương pháp dự báo dựa trên hiệu suất thực tế.
 */
@Service
@RequiredArgsConstructor
public class BurndownService {

    private final BoardRepository boardRepo;
    private final CardRepository cardRepo;
    private final CardHistoryRepository cardHistoryRepo;
    private final DailySnapshotRepository snapshotRepo;

    /**
     * Lấy dữ liệu Burndown và Velocity cho một board
     */
    public BurndownResponse getBurndownData(Long boardId) {
        Board board = boardRepo.findById(boardId)
                .orElseThrow(() -> new RuntimeException("Board not found"));

        List<Card> cards = cardRepo.findByBoard(board);
        List<CardHistory> histories = cardHistoryRepo.findByBoardOrderByChangeDateDescIdDesc(board);

        // Nếu chưa có snapshot, tạo snapshot từ dữ liệu hiện tại
        ensureSnapshotsExist(board, cards, histories);

        // Lấy tất cả snapshots
        List<DailySnapshot> snapshots = snapshotRepo.findByBoardOrderBySnapshotDateAsc(board);

        // Tính toán các thông số
        double totalPoints = calculateTotalPoints(cards);
        double completedPoints = calculateCompletedPoints(cards);
        double remainingPoints = totalPoints - completedPoints;

        // Xây dựng dữ liệu Burndown
        List<BurndownPoint> burndownData = buildBurndownData(board, snapshots, totalPoints);

        // Xây dựng dữ liệu Velocity theo tuần
        List<WeeklyVelocity> velocityData = buildVelocityData(snapshots);

        // Tính Velocity trung bình (points/tuần)
        double averageVelocity = calculateAverageVelocity(velocityData);

        // Dự báo ngày hoàn thành
        LocalDate estimatedEndDate = calculateEstimatedEndDate(remainingPoints, averageVelocity);

        // Đánh giá rủi ro so với deadline
        LocalDate deadline = board.getEndDate();
        Integer daysAheadOrBehind = null;
        String projectHealth = "ON_TRACK";

        if (deadline != null && estimatedEndDate != null) {
            daysAheadOrBehind = (int) ChronoUnit.DAYS. between(estimatedEndDate, deadline);
            if (daysAheadOrBehind < 0) {
                projectHealth = "DELAYED";
            } else if (daysAheadOrBehind <= 3) {
                projectHealth = "AT_RISK";
            }
        }

        return new BurndownResponse(
                burndownData,
                velocityData,
                averageVelocity,
                totalPoints,
                completedPoints,
                remainingPoints,
                estimatedEndDate,
                deadline,
                daysAheadOrBehind,
                projectHealth
        );
    }

    /**
     * Đảm bảo có snapshot cho các ngày từ khi tạo board đến hiện tại
     */
    @Transactional
    public void ensureSnapshotsExist(Board board, List<Card> cards, List<CardHistory> histories) {
        LocalDate startDate = board.getCreatedAt().toLocalDate();
        LocalDate today = LocalDate.now();

        // Lấy snapshot cuối cùng
        Optional<DailySnapshot> lastSnapshot = snapshotRepo.findTopByBoardOrderBySnapshotDateDesc(board);
        LocalDate lastSnapshotDate = lastSnapshot. map(DailySnapshot::getSnapshotDate)
                .orElse(startDate. minusDays(1));

        // Tạo snapshot cho các ngày còn thiếu
        LocalDate currentDate = lastSnapshotDate. plusDays(1);
        while (!currentDate.isAfter(today)) {
            createSnapshotForDate(board, cards, histories, currentDate);
            currentDate = currentDate.plusDays(1);
        }
    }

    /**
     * Tạo snapshot cho một ngày cụ thể
     */
    @Transactional
    public void createSnapshotForDate(Board board, List<Card> cards,
                                      List<CardHistory> histories, LocalDate date) {
        // Kiểm tra đã tồn tại chưa
        if (snapshotRepo.findByBoardAndSnapshotDate(board, date).isPresent()) {
            return;
        }

        LocalDateTime endOfDay = date.atTime(23, 59, 59);

        // Tìm các card đã DONE tính đến ngày này
        Set<Long> doneCardIds = new HashSet<>();
        Map<Long, LocalDateTime> firstDoneTime = new HashMap<>();

        for (CardHistory h : histories) {
            if (h. getToStatus() == Status.DONE && ! h.getChangeDate().isAfter(endOfDay)) {
                Long cardId = h. getCard().getId();
                if (! firstDoneTime.containsKey(cardId) ||
                        h.getChangeDate().isBefore(firstDoneTime.get(cardId))) {
                    firstDoneTime.put(cardId, h.getChangeDate());
                }
                doneCardIds. add(cardId);
            }
        }

        // Tính toán các chỉ số
        double completedPoints = 0;
        double completedPointsDaily = 0;
        int completedTasks = 0;
        int completedTasksDaily = 0;
        double totalPoints = 0;

        LocalDate previousDay = date.minusDays(1);

        for (Card card : cards) {
            // Chỉ tính card đã được tạo trước hoặc trong ngày này
            if (card.getCreatedAt() != null && ! card.getCreatedAt().toLocalDate().isAfter(date)) {
                double points = card.getEstimateHours() != null ? card.getEstimateHours() : 1.0;
                totalPoints += points;

                if (doneCardIds.contains(card.getId())) {
                    completedPoints += points;
                    completedTasks++;

                    // Kiểm tra nếu hoàn thành trong ngày này
                    LocalDateTime doneTime = firstDoneTime.get(card.getId());
                    if (doneTime != null && doneTime.toLocalDate().equals(date)) {
                        completedPointsDaily += points;
                        completedTasksDaily++;
                    }
                }
            }
        }

        double remainingPoints = totalPoints - completedPoints;
        int remainingTasks = (int) cards.stream()
                .filter(c -> c.getCreatedAt() != null && !c.getCreatedAt().toLocalDate().isAfter(date))
                .count() - completedTasks;

        DailySnapshot snapshot = DailySnapshot.builder()
                .board(board)
                .snapshotDate(date)
                .remainingPoints(remainingPoints)
                .completedPoints(completedPoints)
                .completedPointsDaily(completedPointsDaily)
                .remainingTasks(remainingTasks)
                .completedTasks(completedTasks)
                .build();

        snapshotRepo. save(snapshot);
    }

    /**
     * Xây dựng dữ liệu cho biểu đồ Burndown
     */
    private List<BurndownPoint> buildBurndownData(Board board, List<DailySnapshot> snapshots,
                                                  double totalPoints) {
        if (snapshots.isEmpty()) {
            return Collections.emptyList();
        }

        List<BurndownPoint> result = new ArrayList<>();

        LocalDate startDate = snapshots.get(0).getSnapshotDate();
        LocalDate endDate = board.getEndDate() != null ?  board.getEndDate() : LocalDate.now().plusDays(14);
        long totalDays = ChronoUnit. DAYS.between(startDate, endDate);

        // Tạo map để tra cứu nhanh
        Map<LocalDate, DailySnapshot> snapshotMap = snapshots.stream()
                .collect(Collectors.toMap(DailySnapshot::getSnapshotDate, s -> s));

        LocalDate currentDate = startDate;
        int dayIndex = 0;
        Double lastRemaining = totalPoints;

        while (! currentDate.isAfter(endDate)) {
            // Tính giá trị ideal (giảm đều từ totalPoints về 0)
            double idealValue = totalDays > 0
                    ? Math.max(0, totalPoints - (totalPoints * dayIndex / totalDays))
                    : 0;

            // Lấy giá trị thực tế từ snapshot
            DailySnapshot snapshot = snapshotMap. get(currentDate);
            Double actualRemaining = snapshot != null ? snapshot.getRemainingPoints() : null;
            Double completedDaily = snapshot != null ?  snapshot.getCompletedPointsDaily() : 0.0;

            // Nếu không có snapshot (ngày tương lai), sử dụng giá trị gần nhất
            if (actualRemaining == null && ! currentDate.isAfter(LocalDate.now())) {
                actualRemaining = lastRemaining;
            }

            if (actualRemaining != null) {
                lastRemaining = actualRemaining;
            }

            result.add(new BurndownPoint(currentDate, actualRemaining, idealValue, completedDaily));

            currentDate = currentDate. plusDays(1);
            dayIndex++;
        }

        return result;
    }

    /**
     * Xây dựng dữ liệu Velocity theo tuần
     */
    private List<WeeklyVelocity> buildVelocityData(List<DailySnapshot> snapshots) {
        if (snapshots.isEmpty()) {
            return Collections.emptyList();
        }

        List<WeeklyVelocity> result = new ArrayList<>();

        // Nhóm snapshots theo tuần (bắt đầu từ thứ 2)
        Map<LocalDate, List<DailySnapshot>> weeklyGroups = snapshots. stream()
                .collect(Collectors. groupingBy(
                        s -> s.getSnapshotDate().with(TemporalAdjusters. previousOrSame(DayOfWeek. MONDAY)),
                        TreeMap::new,
                        Collectors.toList()
                ));

        int weekNumber = 1;
        for (Map.Entry<LocalDate, List<DailySnapshot>> entry : weeklyGroups.entrySet()) {
            LocalDate weekStart = entry.getKey();
            LocalDate weekEnd = weekStart.plusDays(6);
            List<DailySnapshot> weekSnapshots = entry.getValue();

            // Tính tổng points và tasks hoàn thành trong tuần
            double weekPoints = weekSnapshots.stream()
                    .mapToDouble(DailySnapshot::getCompletedPointsDaily)
                    .sum();

            // Đếm tasks hoàn thành trong tuần (tính từ chênh lệch)
            int weekTasks = 0;
            if (weekSnapshots. size() > 0) {
                DailySnapshot lastOfWeek = weekSnapshots.get(weekSnapshots.size() - 1);
                DailySnapshot firstOfWeek = weekSnapshots.get(0);
                weekTasks = lastOfWeek.getCompletedTasks() -
                        (weekSnapshots.size() > 1 ?  weekSnapshots.get(0).getCompletedTasks() : 0);
                if (weekTasks < 0) weekTasks = 0;
            }

            String weekLabel = String.format("Tuần %d (%s - %s)",
                    weekNumber,
                    weekStart. getDayOfMonth() + "/" + weekStart.getMonthValue(),
                    weekEnd.getDayOfMonth() + "/" + weekEnd.getMonthValue());

            result. add(new WeeklyVelocity(weekLabel, weekStart, weekEnd, weekPoints, weekTasks));
            weekNumber++;
        }

        return result;
    }

    /**
     * Tính Velocity trung bình (points/tuần)
     */
    private double calculateAverageVelocity(List<WeeklyVelocity> velocityData) {
        if (velocityData. isEmpty()) {
            return 0;
        }

        // Chỉ tính các tuần đã hoàn thành (không tính tuần hiện tại nếu chưa kết thúc)
        LocalDate today = LocalDate.now();
        List<WeeklyVelocity> completedWeeks = velocityData. stream()
                .filter(v -> v.weekEnd().isBefore(today))
                .collect(Collectors.toList());

        if (completedWeeks.isEmpty()) {
            // Nếu chưa có tuần nào hoàn thành, tính trung bình từ tất cả
            return velocityData.stream()
                    .mapToDouble(WeeklyVelocity:: completedPoints)
                    .average()
                    .orElse(0);
        }

        return completedWeeks. stream()
                .mapToDouble(WeeklyVelocity::completedPoints)
                .average()
                .orElse(0);
    }

    /**
     * Dự báo ngày hoàn thành dựa trên Velocity
     * Công thức:  T = Remaining Points / Average Velocity (tuần)
     */
    private LocalDate calculateEstimatedEndDate(double remainingPoints, double averageVelocity) {
        if (remainingPoints <= 0) {
            return LocalDate.now(); // Đã hoàn thành
        }

        if (averageVelocity <= 0) {
            return null; // Không đủ dữ liệu để dự báo
        }

        // Tính số tuần cần thiết
        double weeksNeeded = remainingPoints / averageVelocity;

        // Chuyển thành số ngày
        long daysNeeded = Math.round(weeksNeeded * 7);

        return LocalDate.now().plusDays(daysNeeded);
    }

    /**
     * Tính tổng story points của tất cả cards
     */
    private double calculateTotalPoints(List<Card> cards) {
        return cards.stream()
                .mapToDouble(c -> c.getEstimateHours() != null ? c. getEstimateHours() : 1.0)
                .sum();
    }

    /**
     * Tính story points đã hoàn thành
     */
    private double calculateCompletedPoints(List<Card> cards) {
        return cards.stream()
                .filter(c -> c. getStatus() == Status.DONE)
                .mapToDouble(c -> c.getEstimateHours() != null ? c. getEstimateHours() : 1.0)
                .sum();
    }

    /**
     * Cập nhật snapshot cho ngày hiện tại (gọi khi có thay đổi task)
     */
    @Transactional
    public void updateTodaySnapshot(Long boardId) {
        Board board = boardRepo.findById(boardId).orElse(null);
        if (board == null) return;

        List<Card> cards = cardRepo.findByBoard(board);
        List<CardHistory> histories = cardHistoryRepo.findByBoardOrderByChangeDateDescIdDesc(board);

        // Xóa snapshot cũ của hôm nay nếu có
        snapshotRepo.findByBoardAndSnapshotDate(board, LocalDate.now())
                .ifPresent(snapshotRepo::delete);

        // Tạo snapshot mới
        createSnapshotForDate(board, cards, histories, LocalDate. now());
    }

    /**
     * Scheduled task:  Tự động tạo snapshot cuối ngày
     * Chạy lúc 23:59 mỗi ngày
     */
    @Scheduled(cron = "0 59 23 * * *")
    @Transactional
    public void createDailySnapshots() {
        List<Board> boards = boardRepo.findAll();
        LocalDate today = LocalDate.now();

        for (Board board : boards) {
            try {
                List<Card> cards = cardRepo.findByBoard(board);
                List<CardHistory> histories = cardHistoryRepo.findByBoardOrderByChangeDateDescIdDesc(board);
                createSnapshotForDate(board, cards, histories, today);
            } catch (Exception e) {
                // Log error but continue with other boards
                System.err.println("Error creating snapshot for board " + board.getId() + ": " + e. getMessage());
            }
        }
    }
}