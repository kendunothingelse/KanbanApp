export const endpoints = {
    auth: {
        login: "/auth/login",
        register: "/auth/register",
    },
    workspace: {
        list: "/workspaces",
        create: "/workspaces",
    },
    boards: {
        list: "/boards", // giả định GET /boards trả danh sách board (bạn có thể bổ sung backend)
        create: "/boards",
        invite: "/boards/invite",
    },
    columns: {
        create: "/columns",
    },
    cards: {
        create: "/cards",
        move: "/cards/move",
        assign: "/cards/assign",
    },
};