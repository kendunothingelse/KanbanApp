package org.example.be.repository;

import org.example.be.entity.Board;
import org.example.be.entity.ColumnEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ColumnRepository extends JpaRepository<ColumnEntity, Long> {
    List<ColumnEntity> findByBoardOrderByPositionAsc(Board board);
}
