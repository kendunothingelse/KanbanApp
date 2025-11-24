package org.example.be.repository;

import org.example.be.entity.KBList;
import org.springframework.data.jpa.repository.JpaRepository;

public interface KBListRepository extends JpaRepository<KBList, Long> {
}
