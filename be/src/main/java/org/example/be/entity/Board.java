package org.example.be.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Board {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @ManyToOne(optional = false)
    private Workspace workspace;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BoardStatus status;          // IN_PROGRESS / DONE

    private LocalDate endDate;           // only ADMIN can set

    private Integer wipLimit;            // limit for IN_PROGRESS cards (optional)

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (status == null) status = BoardStatus.IN_PROGRESS;
        if (createdAt == null) createdAt = LocalDateTime.now();
    }
}