package org.example.be.repository;

import org.example.be.entity.CardHistory;
import org.example.be.entity.Board;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CardHistoryRepository extends JpaRepository<CardHistory, Long> {
    // histories of all cards belonging to a board, newest first
    List<CardHistory> findByCard_BoardOrderByChangeDateDesc(Board board);
}