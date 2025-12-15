package org.example.kanban.service;

import lombok.RequiredArgsConstructor;
import org.example.kanban.auth.dto.WorkspaceDtos;
import org.example.kanban.entity.Workspace;
import org.example.kanban.repository.WorkspaceRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WorkspaceService {

    private final WorkspaceRepository workspaceRepository;

    public Workspace create(WorkspaceDtos.WorkspaceCreateRequest req) {
        Workspace ws = Workspace.builder()
                .name(req.name())
                .build();
        return workspaceRepository.save(ws);
    }

    public Workspace get(Long id) {
        return workspaceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Workspace not found"));
    }

    public List<Workspace> list() {
        return workspaceRepository.findAll();
    }

    public Workspace update(Long id, WorkspaceDtos.WorkspaceUpdateRequest req) {
        Workspace ws = get(id);
        ws.setName(req.name());
        return workspaceRepository.save(ws);
    }

    public void delete(Long id) {
        Workspace ws = get(id);
        workspaceRepository.delete(ws);
    }
}