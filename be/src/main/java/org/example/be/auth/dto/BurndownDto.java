package org.example.be.auth.dto;

import java.time.LocalDate;
import java.util.List;

/**
 * DTO chứa dữ liệu cho biểu đồ Burndown Chart & Velocity
 */
public class BurndownDto {

    // Một điểm dữ liệu trên biểu đồ Burndown
    public record BurndownPoint(
            LocalDate date,           // Ngày
            Double remaining,         // Story points còn lại (đường thực tế)
            Double ideal,             // Story points theo kế hoạch (đường lý tưởng)
            Double completedDaily     // Story points hoàn thành trong ngày
    ) {}

    // Dữ liệu Velocity theo tuần
    public record WeeklyVelocity(
            String weekLabel,         // Nhãn tuần (VD: "Tuần 1", "23/12 - 29/12")
            LocalDate weekStart,      // Ngày bắt đầu tuần
            LocalDate weekEnd,        // Ngày kết thúc tuần
            Double completedPoints,   // Story points hoàn thành trong tuần
            Integer completedTasks    // Số task hoàn thành trong tuần
    ) {}

    // Response tổng hợp cho Burndown và Velocity
    public record BurndownResponse(
            List<BurndownPoint> burndownData,      // Dữ liệu cho biểu đồ Burndown
            List<WeeklyVelocity> velocityData,     // Dữ liệu cho biểu đồ Velocity
            Double averageVelocity,                // Velocity trung bình (points/tuần)
            Double totalPoints,                    // Tổng story points của dự án
            Double completedPoints,                // Story points đã hoàn thành
            Double remainingPoints,                // Story points còn lại
            LocalDate estimatedEndDate,            // Ngày dự kiến hoàn thành
            LocalDate projectDeadline,             // Deadline của dự án (nếu có)
            Integer daysAheadOrBehind,             // Số ngày sớm (+) hoặc trễ (-) so với deadline
            String projectHealth                   // Trạng thái:  "ON_TRACK", "AT_RISK", "DELAYED"
    ) {}
}