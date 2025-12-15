package org.example.kanban.repository;

import org.example.kanban.entity.Card;
import org.example.kanban.entity.CardAssignee;
import org.example.kanban.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CardAssigneeRepository extends JpaRepository<CardAssignee, Long> {
    List<CardAssignee> findByCard(Card card);

    boolean existsByCardAndUser(Card card, User user);
}