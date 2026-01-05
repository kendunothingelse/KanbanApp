package org.example.be.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

/**
 * Entity lưu trữ "ảnh chụp" dữ liệu thống kê mỗi ngày cho từng board.
 * Giúp tối ưu hiệu suất khi vẽ biểu đồ Burndown thay vì tính toán lại từ đầu.
 */
@Entity
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Table(uniqueConstraints = @UniqueConstraint(columnNames = {"board_id", "snapshot_date"}))
public class DailySnapshot {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "board_id")
    private Board board;

    // Ngày chụp snapshot
    @Column(name = "snapshot_date", nullable = false)
    private LocalDate snapshotDate;

    // Tổng story points (estimateHours) còn lại chưa DONE tính đến ngày này
    @Column(nullable = false)
    private Double remainingPoints;

    // Tổng story points đã hoàn thành tính đến ngày này (cộng dồn)
    @Column(nullable = false)
    private Double completedPoints;

    // Story points hoàn thành riêng trong ngày này
    @Column(nullable = false)
    private Double completedPointsDaily;

    // Tổng số task còn lại
    @Column(nullable = false)
    private Integer remainingTasks;

    // Tổng số task đã DONE
    @Column(nullable = false)
    private Integer completedTasks;
}