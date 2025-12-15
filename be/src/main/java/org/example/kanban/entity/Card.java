package org.example.kanban.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Card {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    private ColumnEntity column;

    @Column(nullable = false)
    private String title;

    private String description;

    private Integer position;

    @CreationTimestamp
    private LocalDateTime createdAt;

    private LocalDate dueDate;

    @Enumerated(EnumType.STRING)
    private Priority priority;
}