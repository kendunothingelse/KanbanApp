package org.example.kanban.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity @Table(name = "columns")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ColumnEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    private Board board;

    @Column(nullable = false)
    private String name;

    // order of column in board
    private Integer position;
}