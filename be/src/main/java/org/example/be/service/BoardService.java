package org.example.be.service;

import lombok.RequiredArgsConstructor;
import org.example.be.auth.dto.BoardDto;
import org.example.be.entity.*;
import org.example.be.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BoardService {
    private final BoardRepository boardRepo;
    private final WorkspaceRepository workspaceRepo;
    private final BoardMemberRepository boardMemberRepo;
    private final PermissionService permissionService;
    private final UserRepository userRepo;
    private final CardRepository cardRepo;
    private final CardAssigneeRepository cardAssigneeRepo;

    @Transactional
    public Board createBoard(BoardDto.BoardCreateRequest req, User current) {
        var ws = workspaceRepo.findById(req.workspaceId())
                .orElseThrow(() -> new RuntimeException("Workspace not found"));
        Board b = Board.builder()
                .name(req.name())
                .workspace(ws)
                .status(BoardStatus.IN_PROGRESS)
                .build();
        boardRepo.save(b);
        boardMemberRepo.save(BoardMember.builder()
                .board(b).user(current).role(Role.ADMIN).build());
        return b;
    }

    @Transactional
    public Board updateBoard(Long id, BoardDto.BoardUpdateRequest req, User current) {
        Board b = boardRepo.findById(id).orElseThrow(() -> new RuntimeException("Board not found"));
        permissionService.checkManageMember(current, b); // only ADMIN

        if (req.name() != null && !req.name().isBlank()) b.setName(req.name());
        if (req.status() != null) b.setStatus(BoardStatus.valueOf(req.status()));
        b.setEndDate(req.endDate());
        b.setWipLimit(req.wipLimit());

        return boardRepo.save(b);
    }

    @Transactional
    public void deleteBoard(Long boardId, User current) {
        Board board = boardRepo.findById(boardId)
                .orElseThrow(() -> new RuntimeException("Board not found"));
        permissionService.checkManageMember(current, board);
        var cards = cardRepo.findByBoard(board);
        for (var card : cards) {
            var assignees = cardAssigneeRepo.findByCard(card);
            cardAssigneeRepo.deleteAll(assignees);
            cardRepo.delete(card);
        }
        var members = boardMemberRepo.findByBoard(board);
        boardMemberRepo.deleteAll(members);
        boardRepo.delete(board);
    }

    public List<Board> listBoardsForUser(User current) {
        var memberships = boardMemberRepo.findByUser(current);
        return memberships.stream().map(BoardMember::getBoard).toList();
    }

    @Transactional
    public void invite(BoardDto.InviteRequest req, User current) {
        Board board = boardRepo.findById(req.boardId())
                .orElseThrow(() -> new RuntimeException("Board not found"));
        permissionService.checkAddMember(current, board); // ADMIN or MEMBER
        User target = userRepo.findById(req.userId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        Role role = Role.valueOf(req.role());
        if (boardMemberRepo.findByBoardAndUser(board, target).isPresent())
            throw new RuntimeException("Already member");
        boardMemberRepo.save(BoardMember.builder()
                .board(board).user(target).role(role).build());
    }

    @Transactional
    public void changeRole(BoardDto.ChangeRoleRequest req, User current) {
        Board board = boardRepo.findById(req.boardId())
                .orElseThrow(() -> new RuntimeException("Board not found"));
        permissionService.checkManageMember(current, board); // ADMIN only
        BoardMember bm = boardMemberRepo.findByBoardAndUser(board,
                        userRepo.findById(req.userId()).orElseThrow())
                .orElseThrow(() -> new RuntimeException("Member not found"));
        bm.setRole(Role.valueOf(req.role()));
        boardMemberRepo.save(bm);
    }

    @Transactional
    public void removeMember(BoardDto.RemoveMemberRequest req, User current) {
        Board board = boardRepo.findById(req.boardId())
                .orElseThrow(() -> new RuntimeException("Board not found"));
        permissionService.checkManageMember(current, board); // ADMIN only
        BoardMember bm = boardMemberRepo.findByBoardAndUser(board,
                        userRepo.findById(req.userId()).orElseThrow())
                .orElseThrow(() -> new RuntimeException("Member not found"));
        boardMemberRepo.delete(bm);
    }
}