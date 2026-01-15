import React, { useEffect, useState } from "react";
import {
    Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
    FormControl, InputLabel, MenuItem, Select, Stack, TextField,
    Typography, FormHelperText
} from "@mui/material";
import api from "../api";
import { labels } from "../utils/labels";
import { Workspace } from "../types"; // Đảm bảo bạn đã export interface Workspace

type UserSuggestion = { id: number; username: string };
const ROLES = ["ADMIN", "MEMBER", "VIEWER"];

// Cập nhật Props: workspaceId có thể null (để user tự chọn), truyền thêm danh sách workspaces
type Props = {
    isOpen: boolean;
    onClose: () => void;
    defaultWorkspaceId?: number | null;
    workspaces: Workspace[]; // Truyền danh sách workspace vào để chọn
    onCreated: () => void;
};

const CreateBoardModal: React.FC<Props> = ({ isOpen, onClose, defaultWorkspaceId, workspaces, onCreated }) => {
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState("");
    const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<number | string>(defaultWorkspaceId || "");
    const [role, setRole] = useState<string>("MEMBER");
    const [query, setQuery] = useState("");
    const [selectedUser, setSelectedUser] = useState<UserSuggestion | null>(null);
    const [suggestions, setSuggestions] = useState<UserSuggestion[]>([]);

    // Reset form khi mở modal
    useEffect(() => {
        if (isOpen) {
            setName("");
            setQuery("");
            setSelectedUser(null);
            // Nếu có default thì set, không thì reset
            setSelectedWorkspaceId(defaultWorkspaceId || "");
        }
    }, [isOpen, defaultWorkspaceId]);

    // Tìm kiếm user (giữ nguyên logic cũ)
    useEffect(() => {
        let ignore = false;
        const fetchSuggestions = async () => {
            if (!query) { setSuggestions([]); return; }
            try {
                const res = await api.get(`/users/search?prefix=${encodeURIComponent(query)}`);
                if (!ignore) setSuggestions(res.data.slice(0, 4));
            } catch { if (!ignore) setSuggestions([]); }
        };
        const timer = setTimeout(fetchSuggestions, 300); // Thêm debounce nhẹ
        return () => { ignore = true; clearTimeout(timer); };
    }, [query]);

    const createBoard = async () => {
        if (!selectedWorkspaceId || Number(selectedWorkspaceId) <= 0) {
            alert(`Vui lòng chọn ${labels.workspace}`);
            return;
        }
        if (!name.trim()) { alert(`Vui lòng nhập tên ${labels.board}`); return; }

        setLoading(true);
        try {
            const res = await api.post("/boards", { name, workspaceId: Number(selectedWorkspaceId) });
            const boardId = res.data.id;
            if (selectedUser) await api.post("/boards/invite", { boardId, userId: selectedUser.id, role });

            onCreated();
            onClose();
        } catch (error: any) {
            alert(error?.response?.data || error.message || "Lỗi tạo dự án");
        } finally { setLoading(false); }
    };

    const showNoResult = query.length > 0 && suggestions.length === 0;

    return (
        <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Tạo {labels.board} mới</DialogTitle>
            <DialogContent dividers>
                <Stack spacing={2.5} mt={1}>
                    {/* Phần chọn Workspace mới thêm vào */}
                    <FormControl fullWidth required>
                        <InputLabel>Chọn {labels.workspace}</InputLabel>
                        <Select
                            value={selectedWorkspaceId}
                            label={`Chọn ${labels.workspace}`}
                            onChange={(e) => setSelectedWorkspaceId(e.target.value)}
                        >
                            {workspaces
                                .filter(ws => ws.id !== 0) // Lọc bỏ workspace "Tất cả" (ID 0)
                                .map((ws) => (
                                    <MenuItem key={ws.id} value={ws.id}>
                                        {ws.name}
                                    </MenuItem>
                                ))}
                        </Select>
                        {workspaces.length <= 1 && (
                            <FormHelperText>Bạn cần tạo Workspace trước khi tạo Board</FormHelperText>
                        )}
                    </FormControl>

                    <TextField
                        label={`Tên ${labels.board}`}
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        fullWidth
                        autoFocus
                    />

                    <Box>
                        <Typography variant="subtitle2" gutterBottom>Thêm thành viên (Tùy chọn)</Typography>
                        <Stack direction="row" spacing={1}>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Nhập username..."
                                value={query}
                                onChange={(e) => { setQuery(e.target.value); setSelectedUser(null); }}
                            />
                            {selectedUser && (
                                <FormControl size="small" sx={{ minWidth: 100 }}>
                                    <Select value={role} onChange={(e) => setRole(e.target.value)}>
                                        {ROLES.map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            )}
                        </Stack>

                        {/* Gợi ý user */}
                        {query && !selectedUser && (
                            <Box border={1} borderColor="grey.300" borderRadius={1} mt={0.5} maxHeight={150} overflow="auto" bgcolor="background.paper">
                                <Stack spacing={0}>
                                    {suggestions.map((s) => (
                                        <Box
                                            key={s.id} px={2} py={1}
                                            sx={{ cursor: "pointer", "&:hover": { bgcolor: "action.hover" } }}
                                            onClick={() => { setSelectedUser(s); setQuery(s.username); }}
                                        >
                                            {s.username}
                                        </Box>
                                    ))}
                                    {showNoResult && <Typography px={2} py={1} color="error" fontSize={13}>Không tìm thấy user</Typography>}
                                </Stack>
                            </Box>
                        )}
                    </Box>
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Hủy</Button>
                <Button onClick={createBoard} variant="contained" disabled={loading}>
                    {loading ? "Đang tạo..." : "Tạo mới"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CreateBoardModal;