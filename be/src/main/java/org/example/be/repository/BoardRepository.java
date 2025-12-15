package org.example.be.repository;

import org.example.be.entity.Board;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BoardRepository extends JpaRepository<Board, Long> {

    // Load board with lists and cards for full view
    @EntityGraph(attributePaths = {"lists", "lists.cards"})
    Optional<Board> findBoardWithListsById(Long id);
}