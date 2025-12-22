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

// types.ts
export interface Board {
    id: number;
    name: string;
    workspace: Workspace;
    status: BoardStatus;
    createdAt?: string;
    endDate?: string;
    wipLimit?: number | null; // thêm | null để gán được null
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
}