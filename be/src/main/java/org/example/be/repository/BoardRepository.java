package org.example.be.repository;

import org.example.be.entity.Board;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BoardRepository extends JpaRepository<Board, Long> {

    // JPQL query to fetch a board and its lists.
    // We will fetch cards, members, and labels in the service layer to avoid MultipleBagFetchException.
    @Query("SELECT b FROM Board b LEFT JOIN FETCH b.lists WHERE b.id = :id")
    Optional<Board> findBoardWithListsById(@Param("id") Long id);
}