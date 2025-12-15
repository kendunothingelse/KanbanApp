package org.example.kanban.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Card {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    private ColumnEntity column;

    @Column(nullable = false)
    private String title;

    private String description;

    private Integer position; // order inside column
}