package org.example.be.repository;

import org.example.be.entity.CardHistory;
import org. example.be.entity.Board;
import org. springframework.data.jpa.repository.JpaRepository;
import org.springframework.data. jpa.repository. Query;
import org.springframework.data. repository.query. Param;
import org.springframework.stereotype. Repository;

import java.util.List;

@Repository
public interface CardHistoryRepository extends JpaRepository<CardHistory, Long> {
    /**
     * Lấy lịch sử của tất cả card thuộc board, sắp xếp theo:
     * 1. changeDate giảm dần (mới nhất lên trên)
     * 2. id giảm dần (để ổn định khi changeDate trùng nhau)
     */
    @Query("SELECT h FROM CardHistory h WHERE h.card.board = :board ORDER BY h.changeDate DESC, h.id DESC")
    List<CardHistory> findByBoardOrderByChangeDateDescIdDesc(@Param("board") Board board);

    // Giữ lại method cũ để tương thích ngược nếu cần
    List<CardHistory> findByCard_BoardOrderByChangeDateDesc(Board board);
}