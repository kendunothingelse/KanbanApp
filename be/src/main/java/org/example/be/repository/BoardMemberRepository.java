package org.example.be.repository;

import org.example.be.entity.Board;
import org.example.be.entity.BoardMember;
import org.example.be.entity.User;
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