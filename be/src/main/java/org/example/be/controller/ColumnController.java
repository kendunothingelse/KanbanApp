package org.example.be.controller;

import org.example.be.auth.dto.*;
import org.example.be.entity.User;
import org.example.be.repository.UserRepository;
import org.example.be.service.ColumnService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/columns")
@RequiredArgsConstructor
public class ColumnController {
    private final ColumnService columnService;
    private final UserRepository userRepo;

    private User current(UserDetails ud) {
        return userRepo.findByUsername(ud.getUsername()).orElseThrow();
    }

    @PostMapping
    public Object create(@RequestBody BoardDto.ColumnCreateRequest req, @AuthenticationPrincipal UserDetails ud) {
        return columnService.create(req, current(ud));
    }

    @PutMapping
    public Object update(@RequestBody ColumnDto.ColumnUpdateRequest req, @AuthenticationPrincipal UserDetails ud) {
        return columnService.update(req, current(ud));
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id, @AuthenticationPrincipal UserDetails ud) {
        columnService.delete(id, current(ud));
    }
}