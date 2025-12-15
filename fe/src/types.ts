export type Workspace = { id: number; name: string };
export type Board = { id: number; name: string; workspace: Workspace };
export type Column = { id: number; name: string; position: number; boardId: number };
export type Card = { id: number; title: string; description?: string; position: number; columnId: number };
export type User = { id: number; username: string };