package org.example.kanban.repository;

import org.example.kanban.entity.Card;
import org.example.kanban.entity.ColumnEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CardRepository extends JpaRepository<Card, Long> {
    List<Card> findByColumnOrderByPositionAsc(ColumnEntity column);
}
