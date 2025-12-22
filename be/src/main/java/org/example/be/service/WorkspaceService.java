package org.example.be.service;

import lombok.RequiredArgsConstructor;
import org.example.be.auth.dto.WorkspaceDtos;
import org.example.be.entity.User;
import org.example.be.entity.Workspace;
import org.example.be.repository.WorkspaceRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WorkspaceService {

    private final WorkspaceRepository workspaceRepository;

    public Workspace create(WorkspaceDtos.WorkspaceCreateRequest req, User current) {
        Workspace ws = Workspace.builder()
                .name(req.name())
                .owner(current)
                .build();
        return workspaceRepository.save(ws);
    }

    public Workspace get(Long id, User current) {
        Workspace ws = workspaceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Workspace not found"));
        if (!ws.getOwner().getId().equals(current.getId()))
            throw new RuntimeException("Forbidden: not your workspace");
        return ws;
    }

    public List<Workspace> list(User current) {
        return workspaceRepository.findByOwner(current);
    }

    public List<Workspace> search(String prefix, User current) {
        if (prefix == null || prefix.isBlank()) return List.of();
        // chỉ gợi ý trong phạm vi workspace của user
        return workspaceRepository.findByOwnerAndNameContainingIgnoreCaseOrderByNameAsc(current, prefix);

    }

    public Workspace update(Long id, WorkspaceDtos.WorkspaceUpdateRequest req, User current) {
        Workspace ws = get(id, current);
        ws.setName(req.name());
        return workspaceRepository.save(ws);
    }

    public void delete(Long id, User current) {
        Workspace ws = get(id, current);
        workspaceRepository.delete(ws);
    }
}