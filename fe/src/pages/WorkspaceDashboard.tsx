import React, {useEffect, useMemo, useState} from "react";
import {
    Avatar,
    Box,
    Button,
    Stack,
    Typography,
    Tooltip,
    TextField,
    Chip,
    LinearProgress,
    Grid,
    Paper,
    IconButton
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {useAuth} from "../auth/AuthContext";
import api from "../api";
import {Board, Workspace, BoardProgress} from "../types";
import CreateBoardModal from "../components/CreateBoardModal";
import {useNavigate} from "react-router-dom";
import CreateWorkspaceButton from "../components/CreateWorkspaceButton";
import ConfirmDialog from "../components/common/ConfirmDialog";
import {getAvatarColor, getAvatarColorDifferent} from "../utils/avatarColor";
import {useNotification} from "../components/NotificationProvider";
import {palette} from "../theme/colors";
import {labels} from "../utils/labels";
import EditWorkspaceModal from "../components/EditWorkspaceModal";

type BoardWithMembers = Board & {
    members?: { id: number; user: { id: number; username: string } }[];
    progress?: BoardProgress;
};

const MAIN_WS: Workspace = {id: 0, name: "Tất cả"};

const WorkspaceDashboard: React.FC = () => {
    const {user, logout} = useAuth();
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [boards, setBoards] = useState<BoardWithMembers[]>([]);
    const [selectedWs, setSelectedWs] = useState<number | null>(null);
    const [wsSearch, setWsSearch] = useState("");
    const nav = useNavigate();
    const {notify} = useNotification();

    const [editWsModalOpen, setEditWsModalOpen] = useState(false);
    const [editingWs, setEditingWs] = useState<Workspace | null>(null);
    const [boardModalOpen, setBoardModalOpen] = useState(false);

    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean;
        type: "workspace" | "board";
        id: number;
        name: string;
        loading: boolean;
    }>({open: false, type: "workspace", id: 0, name: "", loading: false});

    const loadBoards = async () => {
        try {
            const res = await api.get("/boards/me");
            const bs: BoardWithMembers[] = res.data;
            const withInfo = await Promise.all(
                bs.map(async (b) => {
                    let members: any[] = [], progress: BoardProgress = {total: 0, done: 0};
                    try { members = (await api.get(`/boards/${b.id}/members`)).data; } catch {}
                    try { progress = (await api.get(`/boards/${b.id}/progress`)).data; } catch {}
                    return {...b, members, progress};
                })
            );
            setBoards(withInfo);
        } catch (e) {
            console.error(e);
        }
    };

    const loadOwnedWorkspaces = async () => {
        try {
            const res = await api.get("/workspaces");
            const list: Workspace[] = [MAIN_WS, ...res.data];
            setWorkspaces(list);
            if (selectedWs === null || !list.find((w) => w.id === selectedWs)) setSelectedWs(MAIN_WS.id);
        } catch (e: any) {
            notify("Lỗi tải dữ liệu", "error");
        }
    };

    useEffect(() => {
        loadOwnedWorkspaces();
        loadBoards();
    }, []);

    const confirmDelete = (type: "workspace" | "board", id: number, name: string) => {
        setDeleteDialog({open: true, type, id, name, loading: false});
    };

    const handleDeleteExecute = async () => {
        const {type, id} = deleteDialog;
        setDeleteDialog(prev => ({...prev, loading: true}));
        try {
            if (type === "workspace") {
                await api.delete(`/workspaces/${id}`);
                notify(`Đã xóa ${labels.workspace}`, "success");
                if (selectedWs === id) setSelectedWs(MAIN_WS.id);
                await loadOwnedWorkspaces();
            } else {
                await api.delete(`/boards/${id}`);
                notify(`Đã xóa ${labels.board}`, "success");
            }
            await loadBoards();
            setDeleteDialog(prev => ({...prev, open: false}));
        } catch (e: any) {
            notify(e?.response?.data || e.message || "Xóa thất bại", "error");
        } finally {
            setDeleteDialog(prev => ({...prev, loading: false}));
        }
    };

    const handleBoardClick = (b: Board) => nav(`/boards/${b.id}`);
    const noWorkspaceOwned = workspaces.filter((w) => w.id !== MAIN_WS.id).length === 0;
    const mainColor = getAvatarColor(user?.username);

    // Danh sách workspace sau khi áp dụng tìm kiếm
    const filteredWorkspaces = useMemo(() => {
        const keyword = wsSearch.trim().toLowerCase();
        if (!keyword) return workspaces;
        return workspaces.filter(ws => ws.name.toLowerCase().includes(keyword));
    }, [wsSearch, workspaces]);

    const renderMembers = (members?: { id: number; user: { username: string } }[]) => {
        if (!members?.length) return null;
        return (
            <Stack direction="row" spacing={0.5} mt={1}>
                {members.slice(0, 3).map((m) => (
                    <Tooltip key={m.id} title={m.user.username}>
                        <Avatar sx={{
                            width: 24,
                            height: 24,
                            fontSize: 10,
                            bgcolor: getAvatarColorDifferent(m.user.username, mainColor)
                        }}>
                            {m.user.username[0]?.toUpperCase()}
                        </Avatar>
                    </Tooltip>
                ))}
            </Stack>
        );
    };
    const statusChip = (status?: string) => status ? (
        <Chip size="small" label={status === "DONE" ? "Hoàn thành" : "Đang làm"}
              color={status === "DONE" ? "success" : "warning"} sx={{height: 20, fontSize: 10}}/>) : null;
    const renderProgressBar = (progress?: BoardProgress) => {
        if (!progress) return null;
        const pct = progress.total ? Math.round((progress.done / progress.total) * 100) : 0;
        return <LinearProgress variant="determinate" value={pct} sx={{mt: 1, borderRadius: 1, height: 6}}
                               color={progress.done === progress.total ? "success" : "warning"}/>;
    };

    const emptyState = noWorkspaceOwned && (
        <Paper sx={{
            p: 4,
            textAlign: "center",
            bgcolor: palette.background.muted,
            border: `1px dashed ${palette.border.main}`
        }}>
            <Typography variant="h6" color="text.primary" gutterBottom>Bắt đầu nhanh</Typography>
            <Typography color="text.secondary" mb={2}>Chưa có {labels.workspace}/{labels.board}. Tạo dự án đầu tiên của
                bạn.</Typography>
            <Stack direction="row" spacing={1} justifyContent="center">
                <CreateWorkspaceButton onCreated={async () => {
                    await loadOwnedWorkspaces();
                    await loadBoards();
                }}/>
                <Button variant="contained" onClick={() => setBoardModalOpen(true)}>Tạo {labels.board} đầu tiên</Button>
            </Stack>
        </Paper>
    );

    const openEditWsModal = (ws: Workspace, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingWs(ws);
        setEditWsModalOpen(true);
    };

    return (
        <Box p={3}>
            <Stack direction={{xs: "column", md: "row"}} spacing={2} alignItems="center" justifyContent="space-between"
                   mb={3}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar sx={{bgcolor: mainColor}}>{user?.username?.[0]?.toUpperCase()}</Avatar>
                    <Typography variant="h6">Không gian làm việc chính</Typography>
                    <Tooltip title="Xem hướng dẫn sử dụng">
                        <IconButton onClick={() => nav("/guide")} color="primary">
                            <HelpOutlineIcon/>
                        </IconButton>
                    </Tooltip>
                </Stack>
                <Stack direction="row" spacing={1.5}>
                    <CreateWorkspaceButton onCreated={async () => {
                        await loadOwnedWorkspaces();
                        await loadBoards();
                    }}/>
                    <Button variant="contained" onClick={() => setBoardModalOpen(true)}>Tạo {labels.board}</Button>
                    <Button variant="outlined" onClick={logout}>Đăng xuất</Button>
                </Stack>
            </Stack>

            <TextField placeholder={`Tìm ${labels.workspace}`} value={wsSearch}
                       onChange={(e) => setWsSearch(e.target.value)} fullWidth size="small" sx={{mb: 2}}/>

            {emptyState}

            {/* Danh sách Workspace (Tabs) với filter theo từ khóa */}
            <Box mb={3} overflow="auto">
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {filteredWorkspaces.map((ws) => (
                        <Stack
                            key={ws.id}
                            direction="row"
                            spacing={0}
                            alignItems="center"
                            border={1}
                            borderColor={selectedWs === ws.id ? "primary.main" : "grey.300"}
                            borderRadius={1}
                            bgcolor={selectedWs === ws.id ? "primary.light" : "transparent"}
                            sx={{transition: "all 0.2s"}}
                        >
                            <Button
                                variant="text"
                                size="small"
                                onClick={() => setSelectedWs(ws.id)}
                                sx={{
                                    textTransform: 'none',
                                    color: selectedWs === ws.id ? "#fff" : "text.primary",
                                    fontWeight: selectedWs === ws.id ? 600 : 400,
                                    px: 2
                                }}
                            >
                                {ws.name}
                            </Button>

                            {ws.id !== MAIN_WS.id && (
                                <Stack direction="row" pr={0.5}>
                                    <Tooltip title="Sửa tên">
                                        <IconButton
                                            size="small"
                                            onClick={(e) => openEditWsModal(ws, e)}
                                            sx={{color: selectedWs === ws.id ? "#fff" : "action.active", p: 0.5}}
                                        >
                                            <EditIcon fontSize="small" sx={{fontSize: 16}}/>
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Xóa">
                                        <IconButton
                                            size="small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                confirmDelete("workspace", ws.id, ws.name);
                                            }}
                                            sx={{color: selectedWs === ws.id ? "#fff" : "error.main", p: 0.5}}
                                        >
                                            <DeleteIcon fontSize="small" sx={{fontSize: 16}}/>
                                        </IconButton>
                                    </Tooltip>
                                </Stack>
                            )}
                        </Stack>
                    ))}
                </Stack>
            </Box>

            {/* Grid các Board */}
            <Grid container spacing={2}>
                {boards
                    .filter((b) => (selectedWs === null || selectedWs === MAIN_WS.id ? true : b.workspace?.id === selectedWs))
                    .map((b) => (
                        <Grid item xs={12} sm={6} md={4} key={b.id}>
                            <Box
                                border={1} borderColor="grey.200" borderRadius={2} p={2}
                                sx={{
                                    cursor: "pointer",
                                    "&:hover": {boxShadow: 3, borderColor: palette.primary.main},
                                    transition: "all 0.2s",
                                    bgcolor: "background.paper",
                                    position: "relative"
                                }}
                                onClick={() => handleBoardClick(b)}
                            >
                                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                    <Box>
                                        <Typography variant="h6" fontWeight={600} noWrap>{b.name}</Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            WS: {b.workspace?.name}
                                        </Typography>
                                    </Box>
                                    <IconButton
                                        size="small"
                                        color="error"
                                        sx={{
                                            mt: -1,
                                            mr: -1,
                                            opacity: 0.6,
                                            "&:hover": {opacity: 1, bgcolor: "error.light"}
                                        }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            confirmDelete("board", b.id, b.name);
                                        }}
                                    >
                                        <DeleteOutlineIcon fontSize="small"/>
                                    </IconButton>
                                </Stack>

                                <Box mt={2}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                        {statusChip(b.status)}
                                        {renderMembers(b.members)}
                                    </Stack>
                                    {renderProgressBar(b.progress)}
                                </Box>
                            </Box>
                        </Grid>
                    ))}
            </Grid>

            <CreateBoardModal
                isOpen={boardModalOpen}
                onClose={() => setBoardModalOpen(false)}
                defaultWorkspaceId={selectedWs === MAIN_WS.id ? null : selectedWs}
                workspaces={workspaces}
                onCreated={async () => {
                    await loadBoards();
                    await loadOwnedWorkspaces();
                }}
            />

            <ConfirmDialog
                open={deleteDialog.open}
                title={`Xóa ${deleteDialog.type === "workspace" ? labels.workspace : labels.board}?`}
                content={`Bạn có chắc chắn muốn xóa "${deleteDialog.name}"? Tất cả dữ liệu bên trong sẽ bị mất vĩnh viễn.`}
                confirmText="Xác nhận xóa"
                loading={deleteDialog.loading}
                onClose={() => setDeleteDialog(prev => ({...prev, open: false}))}
                onConfirm={handleDeleteExecute}
            />
            <EditWorkspaceModal
                open={editWsModalOpen}
                onClose={() => setEditWsModalOpen(false)}
                workspace={editingWs}
                onUpdated={async () => {
                    await loadOwnedWorkspaces();
                    await loadBoards();
                }}
            />
        </Box>
    );
};

export default WorkspaceDashboard;