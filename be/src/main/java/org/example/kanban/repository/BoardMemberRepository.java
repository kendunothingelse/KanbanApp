package org.example.kanban.repository;

import org.example.kanban.entity.Board;
import org.example.kanban.entity.BoardMember;
import org.example.kanban.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BoardMemberRepository extends JpaRepository<BoardMember, Long> {
    Optional<BoardMember> findByBoardAndUser(Board board, User user);
    List<BoardMember> findByBoard(Board board);
    List<BoardMember> findByUser(User user);
}