package org.example.kanban.service;


import lombok.RequiredArgsConstructor;
import org.example.kanban.entity.Board;
import org.example.kanban.entity.Permission;
import org.example.kanban.entity.Role;
import org.example.kanban.entity.User;
import org.example.kanban.repository.BoardMemberRepository;
import org.springframework.stereotype.Service;

import java.util.EnumSet;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class PermissionService {
    private final BoardMemberRepository boardMemberRepository;

    private static final Map<Role, Set<Permission>> ROLE_PERMISSIONS = Map.of(
            Role.ADMIN, EnumSet.allOf(Permission.class),
            Role.MEMBER, EnumSet.of(Permission.CARD_EDIT, Permission.CARD_VIEW),
            Role.VIEWER, EnumSet.of(Permission.CARD_VIEW)
    );

    public boolean hasPermission(User user, Board board, Permission permission) {
        var memberOpt = boardMemberRepository.findByBoardAndUser(board, user);
        if (memberOpt.isEmpty()) return false;
        Role role = memberOpt.get().getRole();
        return ROLE_PERMISSIONS.getOrDefault(role, Set.of()).contains(permission);
    }

    public void check(User user, Board board, Permission permission) {
        if (!hasPermission(user, board, permission))
            throw new RuntimeException("Forbidden: lacking permission " + permission);
    }

    public void checkManageMember(User user, Board board) {
        check(user, board, Permission.BOARD_MANAGE); // chỉ ADMIN có
    }
}