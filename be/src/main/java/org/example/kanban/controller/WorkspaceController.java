package org.example.kanban.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.kanban.auth.dto.WorkspaceDtos;
import org.example.kanban.entity.User;
import org.example.kanban.entity.Workspace;
import org.example.kanban.repository.UserRepository;
import org.example.kanban.service.WorkspaceService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/workspaces")
@RequiredArgsConstructor
public class WorkspaceController {

    private final WorkspaceService workspaceService;
    private final UserRepository userRepo;

    private User current(UserDetails ud) {
        return userRepo.findByUsername(ud.getUsername()).orElseThrow();
    }

    @PostMapping
    public Workspace create(@RequestBody @Valid WorkspaceDtos.WorkspaceCreateRequest req,
                            @AuthenticationPrincipal UserDetails ud) {
        return workspaceService.create(req, current(ud));
    }

    @GetMapping("/{id}")
    public Workspace get(@PathVariable Long id, @AuthenticationPrincipal UserDetails ud) {
        return workspaceService.get(id, current(ud));
    }

    @GetMapping
    public List<Workspace> list(@AuthenticationPrincipal UserDetails ud) {
        return workspaceService.list(current(ud));
    }

    @GetMapping("/search")
    public List<Workspace> search(@RequestParam("q") String q, @AuthenticationPrincipal UserDetails ud) {
        return workspaceService.search(q, current(ud));
    }

    @PutMapping("/{id}")
    public Workspace update(@PathVariable Long id,
                            @RequestBody @Valid WorkspaceDtos.WorkspaceUpdateRequest req,
                            @AuthenticationPrincipal UserDetails ud) {
        return workspaceService.update(id, req, current(ud));
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id, @AuthenticationPrincipal UserDetails ud) {
        workspaceService.delete(id, current(ud));
    }
}