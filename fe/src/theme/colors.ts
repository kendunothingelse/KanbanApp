/**
 * Bảng màu chính của hệ thống theo quy tắc 60-30-10
 * - 60% Màu chủ đạo:  rgb(252, 250, 238) - Kem nhạt (nền, background)
 * - 30% Màu thứ cấp: rgb(80, 118, 135) - Xanh xám (bổ trợ, secondary)
 * - 10% Màu nhấn:  rgb(184, 0, 31) - Đỏ đậm (nổi bật, accent)
 * - Màu bổ sung: rgb(56, 75, 112) - Xanh navy (text, headers)
 */

export const palette = {
    // Màu chính - Xanh Navy (cho text, headers)
    primary: {
        main: "#384B70",      // rgb(56, 75, 112)
        light: "#4A5F8A",
        dark: "#2A3A56",
        contrastText: "#FFFFFF",
    },

    // Màu phụ - Xanh xám (30%)
    secondary: {
        main: "#507687",      // rgb(80, 118, 135)
        light: "#6A8FA0",
        dark:  "#3D5A68",
        contrastText: "#FFFFFF",
    },

    // Màu nhấn - Đỏ đậm (10%)
    accent: {
        main: "#B8001F",      // rgb(184, 0, 31)
        light: "#D42040",
        dark:  "#8F0018",
        contrastText: "#FFFFFF",
    },

    // Màu cảnh báo
    warning: {
        main: "#E6A23C",
        light: "#F0C78A",
        dark:  "#C48620",
        contrastText: "#1A1A1A",
    },

    // Màu nền - Kem nhạt (60%)
    background: {
        default: "#FCFAEE",   // rgb(252, 250, 238)
        paper: "#FFFFFF",
        muted: "#F8F6EA",
    },

    // Màu trạng thái
    status: {
        success: "#507687",   // Secondary
        error: "#B8001F",     // Accent
        warning:  "#E6A23C",
        info: "#384B70",      // Primary
    },

    // Màu text
    text: {
        primary: "#384B70",   // Navy
        secondary: "#507687", // Xanh xám
        disabled: "#A0AEC0",
    },

    // Màu border
    border: {
        light: "#E2E8F0",
        main: "#CBD5E0",
        dark: "#A0AEC0",
    },
};

// Màu cho các trạng thái task
export const taskStatusColors:  Record<string, string> = {
    TODO: "#507687",          // Secondary - Xanh xám
    IN_PROGRESS: "#E6A23C",   // Warning - Vàng cam
    DONE:  "#384B70",          // Primary - Navy
};

// Màu cho priority
export const priorityColors: Record<string, string> = {
    LOW: "#507687",           // Secondary
    MEDIUM: "#E6A23C",        // Warning
    HIGH: "#B8001F",          // Accent - Đỏ
};

// Màu cho project health
export const healthColors: Record<string, string> = {
    ON_TRACK: "#507687",      // Secondary
    AT_RISK: "#E6A23C",       // Warning
    DELAYED: "#B8001F",       // Accent
};