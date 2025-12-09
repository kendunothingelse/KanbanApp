package org.example.be.service;

import lombok.RequiredArgsConstructor;
import org.example.be.dto.BoardMemberResponse;
import org.example.be.dto.InviteMemberRequest;
import org.example.be.entity.Board;
import org.example.be.entity.BoardMember;
import org.example.be.entity.BoardRole;
import org.example.be.entity.User;
import org.example.be.exception.UnauthorizedException;
import org.example.be.repository.BoardMemberRepository;
import org.example.be.repository.BoardRepository;
import org.example.be.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BoardService {

    private final BoardRepository boardRepository;
    private final BoardMemberRepository boardMemberRepository;
    private final UserRepository userRepository;

    public List<Board> findAllBoards() {
        return boardRepository.findAll();
    }

    // Use JOIN FETCH to load lists, and rely on transactional context for cards.
    @Transactional
    public Optional<Board> findFullBoardById(Long id) {
        Optional<Board> boardOpt = boardRepository.findBoardWithListsById(id);
        boardOpt.ifPresent(board -> {
            // Initialize cards within the transaction to avoid lazy loading issues
            board.getLists().forEach(list -> list.getCards().size());
        });
        return boardOpt;
    }

    public Optional<Board> findBoardById(Long id) {
        return boardRepository.findById(id);
    }

    @Transactional
    public Board createBoard(String name, Long creatorId) {
        User creator = userRepository.findById(creatorId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Board board = new Board();
        board.setName(name);
        board.setCreator(creator);
        board = boardRepository.save(board);

        // Automatically add creator as ADMIN
        BoardMember boardMember = new BoardMember();
        boardMember.setBoard(board);
        boardMember.setUser(creator);
        boardMember.setRole(BoardRole.ADMIN);
        boardMemberRepository.save(boardMember);

        return board;
    }


    @Transactional
    public Board saveBoard(Board board) {
        // Logic to assign creator as admin would go here
        return boardRepository.save(board);
    }

    @Transactional
    public void deleteBoard(Long id) {
        boardRepository.deleteById(id);
    }

    // Permission checking methods
    public boolean hasAccess(Long boardId, Long userId) {
        return boardMemberRepository.existsByBoardIdAndUserId(boardId, userId);
    }

    public void requireAdmin(Long boardId, Long userId) {
        if (!isAdmin(boardId, userId)) {
            throw new UnauthorizedException("Only ADMIN can perform this action");
        }
    }

    public boolean isAdmin(Long boardId, Long userId) {
        Optional<BoardMember> membership = boardMemberRepository
                .findByBoardIdAndUserIdAndRole(boardId, userId, BoardRole.ADMIN);
        return membership.isPresent();
    }

    public void requireAccess(Long boardId, Long userId) {
        if (!hasAccess(boardId, userId)) {
            throw new UnauthorizedException("You don't have access to this board");
        }
    }

    // Member management
    @Transactional
    public BoardMemberResponse inviteMember(Long boardId, Long inviterId, InviteMemberRequest request) {
        requireAdmin(boardId, inviterId);

        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new RuntimeException("Board not found"));
        User user = userRepository.findById(request.userId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if already member
        if (boardMemberRepository.existsByBoardIdAndUserId(boardId, request.userId())) {
            throw new RuntimeException("User is already a member");
        }

        BoardMember boardMember = new BoardMember();
        boardMember.setBoard(board);
        boardMember.setUser(user);
        boardMember.setRole(request.role());
        boardMember = boardMemberRepository.save(boardMember);

        return mapToResponse(boardMember);
    }

    private BoardMemberResponse mapToResponse(BoardMember bm) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        return new BoardMemberResponse(
                bm.getId(),
                bm.getUser().getId(),
                bm.getUser().getUsername(),
                bm.getUser().getEmail(),
                bm.getRole(),
                bm.getJoinedAt().format(formatter)
        );
    }

    @Transactional
    public BoardMemberResponse updateMemberRole(Long boardId, Long adminId, Long memberIdToUpdate, BoardRole newRole) {
        requireAdmin(boardId, adminId);

        BoardMember membership = boardMemberRepository.findByBoardIdAndUserId(boardId, memberIdToUpdate)
                .orElseThrow(() -> new RuntimeException("Member not found"));

        membership.setRole(newRole);
        membership = boardMemberRepository.save(membership);

        return mapToResponse(membership);
    }

    public List<Board> getUserBoards(Long userId) {
        List<BoardMember> memberships = boardMemberRepository.findByUserId(userId);
        return memberships.stream()
                .map(BoardMember::getBoard)
                .collect(Collectors.toList());
    }

    @Transactional
    public void removeMember(Long boardId, Long adminId, Long memberIdToRemove) {
        requireAdmin(boardId, adminId);

        BoardMember membership = boardMemberRepository.findByBoardIdAndUserId(boardId, memberIdToRemove)
                .orElseThrow(() -> new RuntimeException("Member not found"));

        // Prevent removing the creator
        Board board = boardRepository.findById(boardId).orElseThrow();
        if (board.getCreator().getId().equals(memberIdToRemove)) {
            throw new RuntimeException("Cannot remove board creator");
        }

        boardMemberRepository.delete(membership);
    }

    public List<BoardMemberResponse> getBoardMembers(Long boardId, Long userId) {
        requireAccess(boardId, userId);

        return boardMemberRepository.findByBoardId(boardId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }


}