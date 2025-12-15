package org.example.kanban.service;

import lombok.RequiredArgsConstructor;
import org.example.kanban.auth.dto.BoardDto;
import org.example.kanban.entity.Board;
import org.example.kanban.entity.BoardMember;
import org.example.kanban.entity.Role;
import org.example.kanban.entity.User;
import org.example.kanban.repository.BoardMemberRepository;
import org.example.kanban.repository.BoardRepository;
import org.example.kanban.repository.UserRepository;
import org.example.kanban.repository.WorkspaceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BoardService {
    private final BoardRepository boardRepo;
    private final WorkspaceRepository workspaceRepo;
    private final BoardMemberRepository boardMemberRepo;
    private final PermissionService permissionService;
    private final UserRepository userRepo;

    @Transactional
    public Board createBoard(BoardDto.BoardCreateRequest req, User current) {
        var ws = workspaceRepo.findById(req.workspaceId())
                .orElseThrow(() -> new RuntimeException("Workspace not found"));
        Board b = Board.builder().name(req.name()).workspace(ws).build();
        boardRepo.save(b);
        // creator is ADMIN
        boardMemberRepo.save(BoardMember.builder()
                .board(b).user(current).role(Role.ADMIN).build());
        return b;
    }

    public List<Board> listBoardsForUser(User current) {
        var memberships = boardMemberRepo.findByUser(current);
        return memberships.stream().map(BoardMember::getBoard).toList();
    }

    @Transactional
    public void invite(BoardDto.InviteRequest req, User current) {
        Board board = boardRepo.findById(req.boardId())
                .orElseThrow(() -> new RuntimeException("Board not found"));
        permissionService.checkManageMember(current, board);
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
        permissionService.checkManageMember(current, board);
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
        permissionService.checkManageMember(current, board);
        BoardMember bm = boardMemberRepo.findByBoardAndUser(board,
                        userRepo.findById(req.userId()).orElseThrow())
                .orElseThrow(() -> new RuntimeException("Member not found"));
        boardMemberRepo.delete(bm);
    }
}