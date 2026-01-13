import React, { useEffect, useState } from "react";
import { Avatar, Box, Button, Stack, Typography, Tooltip, TextField, Alert, AlertTitle, Chip, LinearProgress, Grid, Paper } from "@mui/material";
import { useAuth } from "../auth/AuthContext";
import api from "../api";
import { Board, Workspace, BoardProgress } from "../types";
import CreateBoardModal from "../components/CreateBoardModal";
import { useNavigate } from "react-router-dom";
import CreateWorkspaceButton from "../components/CreateWorkspaceButton";
import { getAvatarColor, getAvatarColorDifferent } from "../utils/avatarColor";
import { useNotification } from "../components/NotificationProvider";
import { palette } from "../theme/colors";
import { labels } from "../utils/labels";

type BoardWithMembers = Board & { members?: { id: number; user: { id: number; username: string } }[]; progress?: BoardProgress; };

const MAIN_WS: Workspace = { id: 0, name: "Tất cả" };

const WorkspaceDashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [boards, setBoards] = useState<BoardWithMembers[]>([]);
    const [selectedWs, setSelectedWs] = useState<number | null>(null);
    const [wsSearch, setWsSearch] = useState("");
    const nav = useNavigate();
    const { notify } = useNotification();

    const loadBoards = async () => {
        const res = await api.get("/boards/me");
        const bs: BoardWithMembers[] = res.data;
        const withMembersAndProgress = await Promise.all(
            bs.map(async (b) => {
                let members: any[] = [];
                let progress: BoardProgress = { total: 0, done: 0 };
                try { members = (await api.get(`/boards/${b.id}/members`)).data; } catch { members = []; }
                try { progress = (await api.get(`/boards/${b.id}/progress`)).data; } catch { progress = { total: 0, done: 0 }; }
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
            if (selectedWs && !list.find((w) => w.id === selectedWs)) setSelectedWs(MAIN_WS.id);
        } catch (e: any) {
            alert(e?.response?.data || e.message || "Lỗi lấy khu vực");
        }
    };

    useEffect(() => { loadOwnedWorkspaces(); loadBoards(); }, []);
    useEffect(() => { if (!wsSearch.trim()) return; (async () => {
        try { setWorkspaces([MAIN_WS, ...(await api.get(`/workspaces/search?q=${encodeURIComponent(wsSearch)}`)).data]); }
        catch (e: any) { alert(e?.response?.data || e.message || "Lỗi tìm"); }
    })(); }, [wsSearch]);

    const handleBoardClick = (b: Board) => nav(`/boards/${b.id}`);

    const deleteWorkspace = async (id: number) => {
        if (id === MAIN_WS.id) return;
        if (!window.confirm("Bạn chắc chắn muốn xóa khu vực này?")) return;
        try { await api.delete(`/workspaces/${id}`); notify("Đã xóa khu vực"); await loadOwnedWorkspaces(); await loadBoards(); }
        catch (e: any) { notify(e?.response?.data || e.message || "Xóa thất bại"); }
    };

    const deleteBoard = async (id: number) => {
        if (!window.confirm("Bạn chắc chắn muốn xóa dự án này?")) return;
        try { await api.delete(`/boards/${id}`); notify("Đã xóa dự án"); await loadBoards(); }
        catch (e: any) { notify(e?.response?.data || e.message || "Xóa dự án thất bại"); }
    };

    const noWorkspaceOwned = workspaces.filter((w) => w.id !== MAIN_WS.id).length === 0;
    const mainColor = getAvatarColor(user?.username);

    const renderMembers = (members?: { id: number; user: { username: string } }[]) => {
        if (!members?.length) return null;
        const firstTwo = members.slice(0, 2);
        const extra = members.length - firstTwo.length;
        return (
            <Stack direction="row" spacing={0.5} alignItems="center" mt={1}>
                {firstTwo.map((m) => (
                    <Tooltip key={m.id} title={m.user.username}>
                        <Avatar sx={{ width: 28, height: 28, bgcolor: getAvatarColorDifferent(m.user.username, mainColor), fontSize: 12 }}>
                            {m.user.username[0]?.toUpperCase()}
                        </Avatar>
                    </Tooltip>
                ))}
                {extra > 0 && <Typography fontSize={12} color="text.secondary">+{extra}</Typography>}
            </Stack>
        );
    };

    const statusChip = (status?: string) => status ? (
        <Chip size="small" label={status === "DONE" ? "Hoàn thành" : "Đang làm"} color={status === "DONE" ? "success" : "warning"} />
    ) : null;

    const renderProgressBar = (progress?: BoardProgress) => {
        if (!progress) return null;
        const { total, done } = progress;
        const pct = total ? Math.round((done / total) * 100) : 0;
        return (
            <Box mt={1}>
                <Stack direction="row" justifyContent="space-between" mb={0.5}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>Tiến độ: {pct}%</Typography>
                    <Typography variant="caption" color={done === total ? "success.main" : "text.secondary"} fontWeight={600}>{done}/{total} việc</Typography>
                </Stack>
                <LinearProgress variant="determinate" value={pct} sx={{ borderRadius: 999 }} color={done === total ? "success" : "warning"} />
            </Box>
        );
    };

    const emptyState = noWorkspaceOwned && (
        <Paper sx={{ p: 4, textAlign: "center", bgcolor: palette.background.muted, border: `1px dashed ${palette.border.main}` }}>
            <Typography variant="h6" color="text.primary" gutterBottom>Bắt đầu nhanh</Typography>
            <Typography color="text.secondary" mb={2}>Chưa có {labels.workspace}/{labels.board}. Tạo dự án đầu tiên của bạn.</Typography>
            <Stack direction="row" spacing={1} justifyContent="center">
                <CreateWorkspaceButton onCreated={async () => { await loadOwnedWorkspaces(); await loadBoards(); }} />
                <Button variant="contained" onClick={() => setBoardModalOpen(true)}>Tạo {labels.board} đầu tiên</Button>
            </Stack>
        </Paper>
    );

    const [boardModalOpen, setBoardModalOpen] = useState(false);

    return (
        <Box p={3}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="center" justifyContent="space-between" mb={3}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar sx={{ bgcolor: mainColor }}>{user?.username?.[0]?.toUpperCase()}</Avatar>
                    <Typography variant="h6">Bảng điều khiển</Typography>
                </Stack>
                <Stack direction="row" spacing={1.5}>
                    <CreateWorkspaceButton onCreated={async () => { await loadOwnedWorkspaces(); await loadBoards(); }} />
                    <Button variant="contained" onClick={() => setBoardModalOpen(true)} disabled={noWorkspaceOwned}>Tạo {labels.board}</Button>
                    <Button variant="outlined" onClick={logout}>Đăng xuất</Button>
                </Stack>
            </Stack>

            <TextField placeholder={`Tìm ${labels.workspace}`} value={wsSearch} onChange={(e) => setWsSearch(e.target.value)} fullWidth size="small" sx={{ mb: 2 }} />

            {emptyState}

            <Box border={1} borderColor="grey.200" borderRadius={1} p={1} maxHeight={220} overflow="auto" mb={2}>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                    {workspaces.map((ws) => (
                        <Stack key={ws.id} direction="row" spacing={0.5} alignItems="center" border={1} borderColor="grey.200" borderRadius={1} p={0.5}>
                            <Button variant={selectedWs === ws.id ? "contained" : "outlined"} size="small" onClick={() => setSelectedWs(ws.id)}>
                                {ws.name}
                            </Button>
                            {ws.id !== MAIN_WS.id && <Button size="small" onClick={() => deleteWorkspace(ws.id)}>X</Button>}
                        </Stack>
                    ))}
                </Stack>
            </Box>

            <Grid container spacing={2}>
                {boards
                    .filter((b) => (selectedWs === null ? true : selectedWs === MAIN_WS.id ? true : b.workspace?.id === selectedWs))
                    .map((b) => (
                        <Grid item xs={12} sm={6} md={4} key={b.id}>
                            <Box border={1} borderColor="grey.200" borderRadius={1.5} p={2} sx={{ cursor: "pointer", "&:hover": { boxShadow: 3 } }} onClick={() => handleBoardClick(b)} bgcolor="background.paper">
                                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <Typography variant="h6">{b.name}</Typography>
                                        {statusChip(b.status)}
                                    </Stack>
                                    <Button size="small" onClick={(e) => { e.stopPropagation(); deleteBoard(b.id); }}>X</Button>
                                </Stack>
                                <Typography variant="body2" color="text.secondary">
                                    {labels.workspace} #{b.workspace?.id ?? "?"}
                                </Typography>
                                {renderMembers(b.members)}
                                {renderProgressBar(b.progress)}
                            </Box>
                        </Grid>
                    ))}
            </Grid>

            <CreateBoardModal isOpen={boardModalOpen} onClose={() => setBoardModalOpen(false)} workspaceId={selectedWs ?? -1} onCreated={async () => { await loadBoards(); await loadOwnedWorkspaces(); }} />
        </Box>
    );
};

export default WorkspaceDashboard;