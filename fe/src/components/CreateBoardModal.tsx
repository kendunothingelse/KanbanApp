import React, { useEffect, useState } from "react";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Select, Stack, TextField, Typography } from "@mui/material";
import api from "../api";
import { labels } from "../utils/labels";

type Props = { isOpen: boolean; onClose: () => void; workspaceId: number; onCreated: () => void };
type UserSuggestion = { id: number; username: string };
const ROLES = ["ADMIN", "MEMBER", "VIEWER"];

const CreateBoardModal: React.FC<Props> = ({ isOpen, onClose, workspaceId, onCreated }) => {
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState("");
    const [role, setRole] = useState<string>("MEMBER");
    const [query, setQuery] = useState("");
    const [selectedUser, setSelectedUser] = useState<UserSuggestion | null>(null);
    const [suggestions, setSuggestions] = useState<UserSuggestion[]>([]);

    useEffect(() => {
        let ignore = false;
        const fetchSuggestions = async () => {
            if (!query) { setSuggestions([]); return; }
            try {
                const res = await api.get(`/users/search?prefix=${encodeURIComponent(query)}`);
                if (!ignore) setSuggestions(res.data.slice(0, 4));
            } catch { if (!ignore) setSuggestions([]); }
        };
        fetchSuggestions();
        return () => { ignore = true; };
    }, [query]);

    const createBoard = async () => {
        if (workspaceId <= 0) { alert("Chưa chọn khu vực làm việc hợp lệ"); return; }
        if (!name.trim()) { alert(`Vui lòng nhập tên ${labels.board}`); return; }
        setLoading(true);
        try {
            const res = await api.post("/boards", { name, workspaceId });
            const boardId = res.data.id;
            if (selectedUser) await api.post("/boards/invite", { boardId, userId: selectedUser.id, role });
            alert(`Tạo ${labels.board} thành công`);
            onCreated();
            onClose();
            setName(""); setQuery(""); setSelectedUser(null); setSuggestions([]);
        } catch (error: any) {
            alert(error?.response?.data || error.message || "Lỗi");
        } finally { setLoading(false); }
    };

    const showNoResult = query.length > 0 && suggestions.length === 0;

    return (
        <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Tạo {labels.board} mới</DialogTitle>
            <DialogContent dividers>
                <Stack spacing={2} mt={1}>
                    <TextField label={`Tên ${labels.board}`} required value={name} onChange={(e) => setName(e.target.value)} fullWidth />
                    <Box>
                        <TextField fullWidth label="Thêm thành viên (tùy chọn, gõ để gợi ý)" placeholder="Nhập chữ cái đầu" value={query} onChange={(e) => { setQuery(e.target.value); setSelectedUser(null); }} />
                        {query && (
                            <Box border={1} borderColor="grey.300" borderRadius={1} mt={1} maxHeight={150} overflow="auto">
                                <Stack spacing={0}>
                                    {suggestions.map((s) => (
                                        <Box key={s.id} px={2} py={1} sx={{ cursor: "pointer", "&:hover": { bgcolor: "grey.100" } }} onClick={() => { setSelectedUser(s); setQuery(s.username); }}>
                                            {s.username}
                                        </Box>
                                    ))}
                                    {showNoResult && (
                                        <Typography px={2} py={1} color="error">
                                            Không tìm thấy tên tương tự
                                        </Typography>
                                    )}
                                </Stack>
                            </Box>
                        )}
                    </Box>
                    {selectedUser && (
                        <FormControl fullWidth>
                            <InputLabel>Quyền</InputLabel>
                            <Select value={role} label="Quyền" onChange={(e) => setRole(e.target.value)}>
                                {ROLES.map((r) => (
                                    <MenuItem key={r} value={r}>
                                        {r}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    )}
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Hủy</Button>
                <Button onClick={createBoard} variant="contained" disabled={loading}>
                    Tạo
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CreateBoardModal;