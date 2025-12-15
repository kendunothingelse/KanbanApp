package org.example.kanban.controller;

import org.example.kanban.auth.dto.*;
import org.example.kanban.entity.Board;
import org.example.kanban.entity.User;
import org.example.kanban.repository.UserRepository;
import org.example.kanban.service.BoardService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/boards")
@RequiredArgsConstructor
public class BoardController {
    private final BoardService boardService;
    private final UserRepository userRepo;

    private User current(UserDetails ud) {
        return userRepo.findByUsername(ud.getUsername()).orElseThrow();
    }

    @PostMapping
    public Object create(@RequestBody BoardDto.BoardCreateRequest req, @AuthenticationPrincipal UserDetails ud) {
        return boardService.createBoard(req, current(ud));
    }

    @DeleteMapping("/{id}")
    public void deleteBoard(@PathVariable Long id, @AuthenticationPrincipal UserDetails ud) {
        boardService.deleteBoard(id, current(ud));
    }

    @GetMapping("/me")
    public List<Board> myBoards(@AuthenticationPrincipal UserDetails ud) {
        return boardService.listBoardsForUser(current(ud));
    }

    @PostMapping("/invite")
    public void invite(@RequestBody BoardDto.InviteRequest req, @AuthenticationPrincipal UserDetails ud) {
        boardService.invite(req, current(ud));
    }

    @PostMapping("/change-role")
    public void changeRole(@RequestBody BoardDto.ChangeRoleRequest req, @AuthenticationPrincipal UserDetails ud) {
        boardService.changeRole(req, current(ud));
    }

    @PostMapping("/remove-member")
    public void removeMember(@RequestBody BoardDto.RemoveMemberRequest req, @AuthenticationPrincipal UserDetails ud) {
        boardService.removeMember(req, current(ud));
    }
}