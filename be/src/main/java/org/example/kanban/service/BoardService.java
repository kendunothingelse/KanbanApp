package org.example.kanban.service;

import lombok.RequiredArgsConstructor;
import org.example.kanban.auth.dto.BoardDto;
import org.example.kanban.entity.*;
import org.example.kanban.repository.BoardMemberRepository;
import org.example.kanban.repository.BoardRepository;
import org.example.kanban.repository.UserRepository;
import org.example.kanban.repository.WorkspaceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    @Transactional
    public void invite(BoardDto.InviteRequest req, User current) {
        Board board = boardRepo.findById(req.boardId())
                .orElseThrow(() -> new RuntimeException("Board not found"));
        permissionService.check(current, board, Permission.BOARD_MANAGE);
        User target = userRepo.findById(req.userId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        Role role = Role.valueOf(req.role());
        if (boardMemberRepo.findByBoardAndUser(board, target).isPresent())
            throw new RuntimeException("Already member");
        boardMemberRepo.save(BoardMember.builder()
                .board(board).user(target).role(role).build());
    }
}