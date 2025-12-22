package org.example.be.repository;

import org.example.be.entity.Card;
import org.example.be.entity.ColumnEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CardRepository extends JpaRepository<Card, Long> {
    List<Card> findByColumnOrderByPositionAsc(ColumnEntity column);
}
