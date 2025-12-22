package org.example.be.service;

import lombok.RequiredArgsConstructor;
import org.example.be.entity.Board;
import org.example.be.entity.Permission;
import org.example.be.entity.Role;
import org.example.be.entity.User;
import org.example.be.repository.BoardMemberRepository;
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
            Role.MEMBER, EnumSet.of(Permission.CARD_EDIT, Permission.CARD_VIEW, Permission.COLUMN_EDIT, Permission.BOARD_MANAGE),
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

    // ADMIN-only (xóa member, đổi role, xóa board…)
    public void checkManageMember(User user, Board board) {
        var memberOpt = boardMemberRepository.findByBoardAndUser(board, user);
        if (memberOpt.isEmpty() || memberOpt.get().getRole() != Role.ADMIN)
            throw new RuntimeException("Forbidden: only ADMIN allowed");
    }

    // ADMIN hoặc MEMBER được mời thêm thành viên
    public void checkAddMember(User user, Board board) {
        var memberOpt = boardMemberRepository.findByBoardAndUser(board, user);
        if (memberOpt.isEmpty()) throw new RuntimeException("Forbidden: not a member");
        Role role = memberOpt.get().getRole();
        if (role != Role.ADMIN && role != Role.MEMBER)
            throw new RuntimeException("Forbidden: only ADMIN/MEMBER can invite");
    }
}