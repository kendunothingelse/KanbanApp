export type Workspace = { id: number; name: string };

export type Board = { id: number; name: string; workspace?: Workspace };

export type Column = { id: number; name: string; position: number; board?: Board };

export type Card = {
    id: number;
    title: string;
    description?: string;
    position: number;
    column: Column;
    dueDate?: string;
    priority?: "LOW" | "MEDIUM" | "HIGH";
};

export type Member = { user: { id: number; username: string }; role: "ADMIN" | "MEMBER" | "VIEWER" };