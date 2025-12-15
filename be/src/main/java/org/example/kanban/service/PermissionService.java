package org.example.kanban.service;

import lombok.RequiredArgsConstructor;
import org.example.kanban.entity.Board;
import org.example.kanban.entity.Permission;
import org.example.kanban.entity.Role;
import org.example.kanban.entity.User;
import org.example.kanban.repository.BoardMemberRepository;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PermissionService {
    private final BoardMemberRepository boardMemberRepository;

    public boolean hasPermission(User user, Board board, Permission permission) {
        var memberOpt = boardMemberRepository.findByBoardAndUser(board, user);
        if (memberOpt.isEmpty()) return false;
        Role role = memberOpt.get().getRole();
        if (role == Role.ADMIN) return true; // ALL
        return switch (role) {
            case MEMBER -> (permission == Permission.CARD_EDIT || permission == Permission.CARD_VIEW);
            case VIEWER -> permission == Permission.CARD_VIEW;
            default -> throw new IllegalStateException("Unexpected value: " + role);
        };
    }

    public void check(User user, Board board, Permission permission) {
        if (!hasPermission(user, board, permission))
            throw new RuntimeException("Forbidden: lacking permission " + permission);
    }
}