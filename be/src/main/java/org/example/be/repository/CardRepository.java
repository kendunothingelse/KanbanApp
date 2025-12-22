package org.example.be.repository;

import org.example.be.entity.Card;
import org.example.be.entity.Board;
import org.example.be.entity.Status;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CardRepository extends JpaRepository<Card, Long> {
    List<Card> findByBoard(Board board);
    List<Card> findByBoardAndStatusOrderByPositionAsc(Board board, Status status);
}