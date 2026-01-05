import React, { useEffect, useState } from "react";
import {
    Avatar,
    Box,
    Button,
    Stack,
    Typography,
    Tooltip,
    TextField,
    Alert,
    AlertTitle,
    Chip,
    LinearProgress,
    Grid,
} from "@mui/material";
import { useAuth } from "../auth/AuthContext";
import api from "../api";
import { Board, Workspace, BoardProgress } from "../types";
import CreateBoardModal from "../components/CreateBoardModal";
import { useNavigate } from "react-router-dom";
import CreateWorkspaceButton from "../components/CreateWorkspaceButton";
import { getAvatarColor, getAvatarColorDifferent } from "../utils/avatarColor";

type BoardWithMembers = Board & {
    members?: { id: number; user: { id: number; username: string } }[];
    progress?: BoardProgress;
};

const MAIN_WS: Workspace = { id: 0, name: "Tất cả board" };

const WorkspaceDashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [boards, setBoards] = useState<BoardWithMembers[]>([]);
    const [selectedWs, setSelectedWs] = useState<number | null>(null);
    const [wsSearch, setWsSearch] = useState("");
    const nav = useNavigate();

    const loadBoards = async () => {
        const res = await api.get("/boards/me");
        const bs: BoardWithMembers[] = res.data;

        const withMembersAndProgress = await Promise.all(
            bs.map(async (b) => {
                let members: any[] = [];
                let progress: BoardProgress = { total: 0, done: 0 };

                try {
                    const memRes = await api.get(`/boards/${b.id}/members`);
                    members = memRes.data;
                } catch {
                    members = [];
                }

                try {
                    const progressRes = await api.get(`/boards/${b.id}/progress`);
                    progress = progressRes.data;
                } catch {
                    progress = { total: 0, done: 0 };
                }

                return { ...b, members, progress };
            })
        );

        setBoards(withMembersAndProgress);
    };

    const loadOwnedWorkspaces = async () => {
        try {
            const res = await api.get("/workspaces");
            const list: Workspace[] = [MAIN_WS, ...res.data];
            setWorkspaces(list);
            if (selectedWs === null) setSelectedWs(MAIN_WS.id);
            if (selectedWs && !list.find((w) => w.id === selectedWs)) {
                setSelectedWs(MAIN_WS.id);
            }
        } catch (e: any) {
            alert(e?.response?.data || e.message || "Lỗi lấy workspace");
        }
    };

    const searchWorkspaces = async (q: string) => {
        if (!q.trim()) {
            await loadOwnedWorkspaces();
            return;
        }
        try {
            const res = await api.get(`/workspaces/search?q=${encodeURIComponent(q)}`);
            setWorkspaces([MAIN_WS, ...res.data]);
        } catch (e: any) {
            alert(e?.response?.data || e.message || "Lỗi tìm workspace");
        }
    };

    useEffect(() => {
        loadOwnedWorkspaces();
        loadBoards();
    }, []);

    useEffect(() => {
        searchWorkspaces(wsSearch);
    }, [wsSearch]);

    const handleBoardClick = (b: Board) => nav(`/boards/${b.id}`);

    const deleteWorkspace = async (id: number) => {
        if (id === MAIN_WS.id) return;
        try {
            await api.delete(`/workspaces/${id}`);
            alert("Đã xóa workspace");
            await loadOwnedWorkspaces();
            await loadBoards();
        } catch (e: any) {
            alert(e?.response?.data || e.message || "Xóa workspace thất bại");
        }
    };

    const deleteBoard = async (id: number) => {
        try {
            await api.delete(`/boards/${id}`);
            alert("Đã xóa board");
            await loadBoards();
        } catch (e: any) {
            alert(e?.response?.data || e.message || "Xóa board thất bại");
        }
    };

    const noWorkspaceOwned = workspaces.filter((w) => w.id !== MAIN_WS.id).length === 0;
    const mainColor = getAvatarColor(user?.username);

    const renderMembers = (members?: { id: number; user: { username: string } }[]) => {
        if (!members || !members.length) return null;
        const firstTwo = members.slice(0, 2);
        const extra = members.length - firstTwo.length;
        return (
            <Stack direction="row" spacing={0.5} alignItems="center" mt={1}>
                {firstTwo.map((m) => (
                    <Tooltip key={m.id} title={m.user.username}>
                        <Avatar
                            sx={{
                                width: 28,
                                height: 28,
                                bgcolor: getAvatarColorDifferent(m.user.username, mainColor),
                                fontSize: 12,
                            }}
                        >
                            {m.user.username[0]?.toUpperCase()}
                        </Avatar>
                    </Tooltip>
                ))}
                {extra > 0 && (
                    <Tooltip title={members.slice(2).map((m) => m.user.username).join(", ")}>
                        <Typography fontSize={12} color="text.secondary">
                            và còn +{extra} người khác
                        </Typography>
                    </Tooltip>
                )}
            </Stack>
        );
    };

    const statusChip = (status?: string) => {
        if (!status) return null;
        const color = status === "DONE" ? "success" : "warning";
        return <Chip size="small" label={status === "DONE" ? "DONE" : "IN PROGRESS"} color={color} />;
    };

    const renderProgressBar = (progress?: BoardProgress) => {
        if (!progress) return null;

        const { total, done } = progress;

        if (total === 0) {
            return (
                <Box mt={1}>
                    <Stack direction="row" justifyContent="space-between" mb={0.5}>
                        <Typography variant="caption" color="text.secondary">
                            Tiến độ
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            0/0 tasks
                        </Typography>
                    </Stack>
                    <LinearProgress variant="determinate" value={0} sx={{ borderRadius: 999 }} />
                </Box>
            );
        }

        const percentage = Math.round((done / total) * 100);
        const isComplete = done === total;
        const color = isComplete ? "success" : "warning";

        return (
            <Box mt={1}>
                <Stack direction="row" justifyContent="space-between" mb={0.5}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        Tiến độ: {percentage}%
                    </Typography>
                    <Typography variant="caption" color={isComplete ? "success.main" : "text.secondary"} fontWeight={600}>
                        {done}/{total} tasks
                    </Typography>
                </Stack>
                <LinearProgress variant="determinate" value={percentage} sx={{ borderRadius: 999 }} color={color as any} />
                {isComplete && total > 0 && (
                    <Typography variant="caption" color="success.main" mt={0.5} fontWeight={600}>
                        ✓ Hoàn thành tất cả tasks!
                    </Typography>
                )}
            </Box>
        );
    };

    const [boardModalOpen, setBoardModalOpen] = useState(false);

    return (
        <Box p={3}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="center" justifyContent="space-between" mb={3}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar sx={{ bgcolor: mainColor }}>{user?.username?.[0]?.toUpperCase()}</Avatar>
                    <Typography variant="h6">Workspace Dashboard</Typography>
                </Stack>
                <Stack direction="row" spacing={1.5}>
                    <CreateWorkspaceButton
                        onCreated={async () => {
                            await loadOwnedWorkspaces();
                            await loadBoards();
                        }}
                    />
                    <Button variant="contained" onClick={() => setBoardModalOpen(true)} disabled={noWorkspaceOwned}>
                        Tạo board mới
                    </Button>
                    <Button variant="outlined" onClick={logout}>
                        Đăng xuất
                    </Button>
                </Stack>
            </Stack>

            <TextField
                placeholder="Tìm kiếm workspace"
                value={wsSearch}
                onChange={(e) => setWsSearch(e.target.value)}
                fullWidth
                size="small"
                sx={{ mb: 2 }}
            />

            {noWorkspaceOwned && (
                <Alert severity="info" sx={{ mb: 2 }}>
                    <AlertTitle>Chưa có workspace!</AlertTitle>
                    Hãy tạo workspace trước khi tạo board.
                </Alert>
            )}

            <Box border={1} borderColor="grey.200" borderRadius={1} p={1} maxHeight={220} overflow="auto" mb={2}>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                    {workspaces.map((ws) => (
                        <Stack
                            key={ws.id}
                            direction="row"
                            spacing={0.5}
                            alignItems="center"
                            border={1}
                            borderColor="grey.200"
                            borderRadius={1}
                            p={0.5}
                        >
                            <Button
                                variant={selectedWs === ws.id ? "contained" : "outlined"}
                                size="small"
                                onClick={() => setSelectedWs(ws.id)}
                            >
                                {ws.name}
                            </Button>
                            {ws.id !== MAIN_WS.id && (
                                <Button size="small" onClick={() => deleteWorkspace(ws.id)}>
                                    X
                                </Button>
                            )}
                        </Stack>
                    ))}
                </Stack>
            </Box>

            <Grid container spacing={2}>
                {boards
                    .filter((b) => (selectedWs === null ? true : selectedWs === MAIN_WS.id ? true : b.workspace?.id === selectedWs))
                    .map((b) => (
                        <Grid item xs={12} sm={6} md={4} key={b.id}>
                            <Box
                                border={1}
                                borderColor="grey.200"
                                borderRadius={1.5}
                                p={2}
                                sx={{ cursor: "pointer", "&:hover": { boxShadow: 3 } }}
                                onClick={() => handleBoardClick(b)}
                                bgcolor="background.paper"
                            >
                                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <Typography variant="h6">{b.name}</Typography>
                                        {statusChip(b.status)}
                                    </Stack>
                                    <Button
                                        size="small"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteBoard(b.id);
                                        }}
                                    >
                                        X
                                    </Button>
                                </Stack>
                                <Typography variant="body2" color="text.secondary">
                                    Workspace #{b.workspace?.id ?? "?"}
                                </Typography>
                                {renderMembers(b.members)}
                                {renderProgressBar(b.progress)}
                            </Box>
                        </Grid>
                    ))}
            </Grid>

            <CreateBoardModal
                isOpen={boardModalOpen}
                onClose={() => setBoardModalOpen(false)}
                workspaceId={selectedWs ?? -1}
                onCreated={async () => {
                    await loadBoards();
                    await loadOwnedWorkspaces();
                }}
            />
        </Box>
    );
};

export default WorkspaceDashboard;