package org.example.be.repository;

import org.example.be.entity.User;
import org.example.be.entity.Workspace;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkspaceRepository extends JpaRepository<Workspace, Long> {
    List<Workspace> findByOwner(User owner);
    List<Workspace> findByOwnerAndNameContainingIgnoreCaseOrderByNameAsc(User owner, String name);

}
