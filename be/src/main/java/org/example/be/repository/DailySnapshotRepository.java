package org.example.be.repository;

import org.example.be.entity.Board;
import org.example.be.entity.DailySnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface DailySnapshotRepository extends JpaRepository<DailySnapshot, Long> {

    // Lấy tất cả snapshot của board sắp xếp theo ngày tăng dần
    List<DailySnapshot> findByBoardOrderBySnapshotDateAsc(Board board);

    // Lấy snapshot của một ngày cụ thể
    Optional<DailySnapshot> findByBoardAndSnapshotDate(Board board, LocalDate snapshotDate);

    // Lấy snapshot trong khoảng thời gian
    @Query("SELECT ds FROM DailySnapshot ds WHERE ds.board = :board " +
            "AND ds.snapshotDate BETWEEN :startDate AND :endDate " +
            "ORDER BY ds.snapshotDate ASC")
    List<DailySnapshot> findByBoardAndDateRange(
            @Param("board") Board board,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    // Lấy snapshot gần nhất của board
    Optional<DailySnapshot> findTopByBoardOrderBySnapshotDateDesc(Board board);

    // Xóa tất cả snapshot của board (khi xóa board)
    void deleteByBoard(Board board);
}