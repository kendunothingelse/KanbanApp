package org.example.kanban.repository;

import org.example.kanban.entity.Board;
import org.example.kanban.entity.ColumnEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ColumnRepository extends JpaRepository<ColumnEntity, Long> {
    List<ColumnEntity> findByBoardOrderByPositionAsc(Board board);
}
