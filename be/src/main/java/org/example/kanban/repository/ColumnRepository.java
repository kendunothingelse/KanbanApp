package org.example.kanban.repository;

import org.example.kanban.entity.Board;
import org.example.kanban.entity.ColumnEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ColumnRepository extends JpaRepository<ColumnEntity, Long> {
    List<ColumnEntity> findByBoardOrderByPositionAsc(Board board);
}
