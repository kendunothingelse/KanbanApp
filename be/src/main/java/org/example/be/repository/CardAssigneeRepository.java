package org.example.be.repository;

import org.example.be.entity.Card;
import org.example.be.entity.CardAssignee;
import org.example.be.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CardAssigneeRepository extends JpaRepository<CardAssignee, Long> {
    List<CardAssignee> findByCard(Card card);

    boolean existsByCardAndUser(Card card, User user);
}