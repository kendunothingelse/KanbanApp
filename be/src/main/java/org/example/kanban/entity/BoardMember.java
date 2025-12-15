package org.example.kanban.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class BoardMember {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    private Board board;

    @ManyToOne(optional = false)
    private User user;

    @Enumerated(EnumType.STRING)
    private Role role;
}