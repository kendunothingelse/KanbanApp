package org.example.be.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.be.dto.BoardMemberResponse;
import org.example.be.dto.InviteMemberRequest;
import org.example.be.entity.Board;
import org.example.be.entity.BoardRole;
import org.example.be.entity.User;
import org.example.be.repository.UserRepository;
import org.example.be.service.BoardService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/boards")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class BoardController {

    private final BoardService boardService;
    private final UserRepository userRepository;

    private Long getCurrentUserId(Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) {
            throw new IllegalStateException("Unauthenticated");
        }
        String email = auth.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("User not found: " + email));
        return user.getId();
    }

    // 1) Get boards of current user (by membership)
    @GetMapping
    public ResponseEntity<List<Board>> getUserBoards(Authentication auth) {
        Long userId = getCurrentUserId(auth);
        List<Board> boards = boardService.getUserBoards(userId);
        return ResponseEntity.ok(boards);
    }

    // 2) Get all boards (admin\-like, no auth check here, secure via SecurityConfig)
    @GetMapping("/all")
    public ResponseEntity<List<Board>> getAllBoards(Authentication auth) {
        List<Board> boards = boardService.findAllBoards();
        return ResponseEntity.ok(boards);
    }

    // 3) Get a single board with lists and cards, with access check
    @GetMapping("/{id}")
    public ResponseEntity<Board> getBoardById(@PathVariable Long id, Authentication auth) {
        Long userId = getCurrentUserId(auth);
        boardService.requireAccess(id, userId);

        return boardService.findFullBoardById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 4) Create board, creator becomes ADMIN member
    @PostMapping
    public ResponseEntity<Board> createBoard(
            @RequestBody Map<String, String> request,
            Authentication auth
    ) {
        Long userId = getCurrentUserId(auth);
        String name = request.get("name");
        Board savedBoard = boardService.createBoard(name, userId);
        return new ResponseEntity<>(savedBoard, HttpStatus.CREATED);
    }

    // 5) Update board name, only ADMIN
    @PutMapping("/{id}")
    public ResponseEntity<Board> updateBoard(
            @PathVariable Long id,
            @RequestBody Map<String, String> request,
            Authentication auth
    ) {
        Long userId = getCurrentUserId(auth);
        boardService.requireAdmin(id, userId);

        return boardService.findBoardById(id)
                .map(board -> {
                    board.setName(request.get("name"));
                    return ResponseEntity.ok(boardService.saveBoard(board));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // 6) Delete board, only ADMIN
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBoard(@PathVariable Long id, Authentication auth) {
        Long userId = getCurrentUserId(auth);
        boardService.requireAdmin(id, userId);
        boardService.deleteBoard(id);
        return ResponseEntity.noContent().build();
    }

    // 7) Invite member (ADMIN only)
    @PostMapping("/{boardId}/members")
    public ResponseEntity<BoardMemberResponse> inviteMember(
            @PathVariable Long boardId,
            @Valid @RequestBody InviteMemberRequest request,
            Authentication auth
    ) {
        Long userId = getCurrentUserId(auth);
        BoardMemberResponse response = boardService.inviteMember(boardId, userId, request);
        return ResponseEntity.ok(response);
    }

    // 8) Get all members of a board (must have access)
    @GetMapping("/{boardId}/members")
    public ResponseEntity<List<BoardMemberResponse>> getBoardMembers(
            @PathVariable Long boardId,
            Authentication auth
    ) {
        Long userId = getCurrentUserId(auth);
        List<BoardMemberResponse> members = boardService.getBoardMembers(boardId, userId);
        return ResponseEntity.ok(members);
    }

    // 9) Remove member (ADMIN only, cannot remove creator)
    @DeleteMapping("/{boardId}/members/{memberId}")
    public ResponseEntity<Void> removeMember(
            @PathVariable Long boardId,
            @PathVariable Long memberId,
            Authentication auth
    ) {
        Long userId = getCurrentUserId(auth);
        boardService.removeMember(boardId, userId, memberId);
        return ResponseEntity.noContent().build();
    }

    // 10) Update member role (ADMIN only)
    @PutMapping("/{boardId}/members/{memberId}/role")
    public ResponseEntity<BoardMemberResponse> updateMemberRole(
            @PathVariable Long boardId,
            @PathVariable Long memberId,
            @RequestBody Map<String, String> request,
            Authentication auth
    ) {
        Long userId = getCurrentUserId(auth);
        BoardRole newRole = BoardRole.valueOf(request.get("role"));
        BoardMemberResponse response = boardService.updateMemberRole(boardId, userId, memberId, newRole);
        return ResponseEntity.ok(response);
    }
}