package org.example.kanban.repository;

import org.example.kanban.entity.Card;
import org.example.kanban.entity.ColumnEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CardRepository extends JpaRepository<Card, Long> {
    List<Card> findByColumnOrderByPositionAsc(ColumnEntity column);
}
