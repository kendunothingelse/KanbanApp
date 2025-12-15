package org.example.kanban.controller;

import lombok.RequiredArgsConstructor;
import org.example.kanban.auth.dto.BoardDto;
import org.example.kanban.entity.User;
import org.example.kanban.repository.UserRepository;
import org.example.kanban.service.BoardService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

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

    @PostMapping("/invite")
    public void invite(@RequestBody BoardDto.InviteRequest req, @AuthenticationPrincipal UserDetails ud) {
        boardService.invite(req, current(ud));
    }
}