export type BoardStatus = 'IN_PROGRESS' | 'DONE';
export type Status = 'TODO' | 'IN_PROGRESS' | 'DONE';

export interface User {
    id: number;
    username: string;
}

export interface Workspace {
    id: number;
    name: string;
}

export interface Board {
    id: number;
    name: string;
    workspace: Workspace;
    status: BoardStatus;
    createdAt?: string;
    endDate?: string;
    wipLimit?: number | null;
}

export interface Card {
    id: number;
    title: string;
    description?: string;
    position: number;
    createdAt?: string;
    dueDate?: string;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH';
    status: Status;
    estimateHours?: number;
    actualHours?: number;
    board: Board;
}

export interface BoardMember {
    id: number;
    user: User;
    board: Board;
    role: 'ADMIN' | 'MEMBER' | 'VIEWER';
}

export interface CardHistory {
    id: number;
    fromStatus: Status;
    toStatus: Status;
    changeDate: string;
    card: Card;
    actor?: User;
}

export interface BoardProgress {
    total: number;
    done: number;
}

// ===== Thêm mới cho Burndown và Velocity =====

/**
 * Một điểm dữ liệu trên biểu đồ Burndown
 */
export interface BurndownPoint {
    date: string;           // Ngày (yyyy-MM-dd)
    remaining: number | null; // Story points còn lại (null cho ngày tương lai)
    ideal: number;          // Story points theo kế hoạch lý tưởng
    completedDaily: number; // Story points hoàn thành trong ngày
}

/**
 * Dữ liệu Velocity theo tuần
 */
export interface WeeklyVelocity {
    weekLabel: string;      // Nhãn tuần
    weekStart: string;      // Ngày bắt đầu tuần
    weekEnd: string;        // Ngày kết thúc tuần
    completedPoints: number; // Story points hoàn thành trong tuần
    completedTasks: number;  // Số task hoàn thành trong tuần
}

/**
 * Response tổng hợp cho Burndown và Velocity
 */
export interface BurndownResponse {
    burndownData: BurndownPoint[];      // Dữ liệu cho biểu đồ Burndown
    velocityData: WeeklyVelocity[];     // Dữ liệu cho biểu đồ Velocity
    averageVelocity: number;            // Velocity trung bình (points/tuần)
    totalPoints: number;                // Tổng story points của dự án
    completedPoints: number;            // Story points đã hoàn thành
    remainingPoints: number;            // Story points còn lại
    estimatedEndDate: string | null;    // Ngày dự kiến hoàn thành
    projectDeadline: string | null;     // Deadline của dự án
    daysAheadOrBehind: number | null;   // Số ngày sớm (+) hoặc trễ (-)
    projectHealth: 'ON_TRACK' | 'AT_RISK' | 'DELAYED'; // Trạng thái dự án
}

