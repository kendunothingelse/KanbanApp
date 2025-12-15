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
}

export interface Column {
    id: number;
    name: string;
    position: number;
    board: Board;
}

export interface Card {
    id: number;
    title: string;
    description?: string;
    position: number;
    createdAt?: string;
    dueDate?: string;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH';
    column: Column;
}

export interface BoardMember {
    id: number;
    user: User;
    board: Board;
    role: 'ADMIN' | 'MEMBER' | 'VIEWER';
}