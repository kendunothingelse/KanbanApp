package org.example.kanban.controller;

import org.example.kanban.auth.dto.*;
import org.example.kanban.entity.User;
import org.example.kanban.repository.UserRepository;
import org.example.kanban.service.CardService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/cards")
@RequiredArgsConstructor
public class CardController {
    private final CardService cardService;
    private final UserRepository userRepo;

    private User current(UserDetails ud) { return userRepo.findByUsername(ud.getUsername()).orElseThrow(); }

    @PostMapping
    public Object create(@RequestBody BoardDto.CardCreateRequest req, @AuthenticationPrincipal UserDetails ud) {
        return cardService.create(req, current(ud));
    }

    @PutMapping
    public Object update(@RequestBody CardDto.CardUpdateRequest req, @AuthenticationPrincipal UserDetails ud) {
        return cardService.update(req, current(ud));
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id, @AuthenticationPrincipal UserDetails ud) {
        cardService.delete(id, current(ud));
    }

    @PostMapping("/move")
    public Object move(@RequestBody BoardDto.MoveCardRequest req, @AuthenticationPrincipal UserDetails ud) {
        return cardService.move(req, current(ud));
    }

    @PostMapping("/assign")
    public void assign(@RequestBody BoardDto.CardAssignRequest req, @AuthenticationPrincipal UserDetails ud) {
        cardService.assign(req, current(ud));
    }
}