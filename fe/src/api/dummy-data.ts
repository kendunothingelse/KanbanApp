// src/data/dummy-data.ts
// src/data/dummy-data.ts
export interface Member {
    id: number;
    name: string;
    avatarUrl?: string;
}

export interface Label {
    id: number;
    name: string;
    color: string;
}

export interface ChecklistItem {
    id: string;
    text: string;
    completed: boolean;
}

export interface Comment {
    id: string;
    author: Member;
    text: string;
    createdAt: string;
}

export interface Card {
    id: number;
    title: string;
    description?: string;
    members?: Member[];
    labels?: Label[];
    checklist?: ChecklistItem[];
    comments?: Comment[];
    dueDate?: string;
    cardOrder?: number;
    listId?: number; // For creating/moving cards
}

export interface List {
    id: number;
    title: string;
    cards: Card[];
    listOrder?: number;
}

export interface Board {
    id: number;
    name: string;
    workspaceId: string;
    lists?: List[];
}
