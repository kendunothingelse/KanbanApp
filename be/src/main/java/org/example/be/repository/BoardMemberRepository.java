package org.example.be.repository;


import org.example.be.entity.BoardMember;
import org.example.be.entity.BoardRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface BoardMemberRepository extends JpaRepository<BoardMember, Long> {

    Optional<BoardMember> findByBoardIdAndUserId(Long boardId, Long userId);

    List<BoardMember> findByBoardId(Long boardId);

    List<BoardMember> findByUserId(Long userId);

    @Query("SELECT bm FROM BoardMember bm WHERE bm.board.id = :boardId AND bm.user.id = :userId AND bm.role = :role")
    Optional<BoardMember> findByBoardIdAndUserIdAndRole(
            @Param("boardId") Long boardId,
            @Param("userId") Long userId,
            @Param("role") BoardRole role
    );

    boolean existsByBoardIdAndUserId(Long boardId, Long userId);
}