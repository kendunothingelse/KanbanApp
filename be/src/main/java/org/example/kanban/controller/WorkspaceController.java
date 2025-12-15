package org.example.kanban.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.kanban.auth.dto.WorkspaceDtos;
import org.example.kanban.entity.Workspace;
import org.example.kanban.repository.WorkspaceRepository;
import org.example.kanban.service.WorkspaceService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/workspaces")
@RequiredArgsConstructor
public class WorkspaceController {

    private final WorkspaceService workspaceService;

    @PostMapping
    public Workspace create(@RequestBody @Valid WorkspaceDtos.WorkspaceCreateRequest req) {
        return workspaceService.create(req);
    }

    @GetMapping("/{id}")
    public Workspace get(@PathVariable Long id) {
        return workspaceService.get(id);
    }

    @GetMapping
    public List<Workspace> list() {
        return workspaceService.list();
    }

    @PutMapping("/{id}")
    public Workspace update(@PathVariable Long id, @RequestBody @Valid WorkspaceDtos.WorkspaceUpdateRequest req) {
        return workspaceService.update(id, req);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        workspaceService.delete(id);
    }
}
