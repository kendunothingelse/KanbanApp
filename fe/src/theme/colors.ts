export const palette = {
    primary: { main: "#384B70", light: "#4A5F8A", dark: "#2A3A56", contrastText: "#FFFFFF" },
    secondary: { main: "#507687", light: "#6A8FA0", dark: "#3D5A68", contrastText: "#FFFFFF" },
    accent: { main: "#B8001F", light: "#D42040", dark: "#8F0018", contrastText: "#FFFFFF" },
    warning: { main: "#E6A23C", light: "#F0C78A", dark: "#C48620", contrastText: "#1A1A1A" },
    // FIX: Thêm error và success vào cấp này để đúng chuẩn MUI
    error: { main: "#B8001F", light: "#EF5350", dark: "#C62828", contrastText: "#FFFFFF" },
    success: { main: "#2E7D32", light: "#4CAF50", dark: "#1B5E20", contrastText: "#FFFFFF" },
    background: { default: "#FCFAEE", paper: "#FFFFFF", muted: "#F8F6EA" },
    status: { success: "#507687", error: "#B8001F", warning: "#E6A23C", info: "#384B70" },
    text: { primary: "#384B70", secondary: "#507687", disabled: "#A0AEC0" },
    border: { light: "#E2E8F0", main: "#CBD5E0", dark: "#A0AEC0" },

};
export const taskStatusColors: Record<string, string> = {
    TODO: "#507687", IN_PROGRESS: "#E6A23C", DONE: "#384B70",
};
export const priorityColors: Record<string, string> = {
    LOW: "#507687", MEDIUM: "#E6A23C", HIGH: "#B8001F",
};
export const healthColors: Record<string, string> = {
    ON_TRACK: "#507687", AT_RISK: "#E6A23C", DELAYED: "#B8001F",
};