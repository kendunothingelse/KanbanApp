package org.example.be.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CardHistory {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    private Card card;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status fromStatus;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status toStatus;

    @Column(nullable = false)
    private LocalDateTime changeDate;

    @ManyToOne(optional = false)
    private User actor; // NEW: ai thao tác
}