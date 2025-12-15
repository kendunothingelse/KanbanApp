package org.example.kanban.controller;

import lombok.RequiredArgsConstructor;
import org.example.kanban.auth.dto.BoardDto;
import org.example.kanban.entity.User;
import org.example.kanban.repository.UserRepository;
import org.example.kanban.service.ColumnService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/columns")
@RequiredArgsConstructor
public class ColumnController {
    private final ColumnService columnService;
    private final UserRepository userRepo;

    private User current(UserDetails ud) { return userRepo.findByUsername(ud.getUsername()).orElseThrow(); }

    @PostMapping
    public Object create(@RequestBody BoardDto.ColumnCreateRequest req, @AuthenticationPrincipal UserDetails ud) {
        return columnService.create(req, current(ud));
    }
}