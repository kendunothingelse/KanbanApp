import React, {useEffect, useState} from "react";
import {
    Button, Dialog, DialogActions, DialogContent, DialogTitle,
    FormControl, InputLabel, MenuItem, Select, Stack, Box, Typography,
    Autocomplete, TextField, Avatar
} from "@mui/material";
import api from "../api";
import {useNotification} from "./NotificationProvider";

type UserSuggestion = { id: number; username: string };

type Props = {
    isOpen: boolean;
    onClose: () => void;
    boardId: number;
    onInvited: () => void;
    defaultRole?: string;
    allowedRoles?: string[];
};

const InviteMemberModal: React.FC<Props> = ({
                                                isOpen, onClose, boardId, onInvited,
                                                defaultRole = "MEMBER", allowedRoles = ["ADMIN", "MEMBER", "VIEWER"],
                                            }) => {
    const { notify } = useNotification();
    const [query, setQuery] = useState("");
    const [selectedUser, setSelectedUser] = useState<UserSuggestion | null>(null);
    const [role, setRole] = useState(defaultRole);
    const [loading, setLoading] = useState(false);
    const [suggestions, setSuggestions] = useState<UserSuggestion[]>([]);
    const [fetching, setFetching] = useState(false);

    useEffect(() => {
        let active = true;
        if (!query) { setSuggestions([]); return; }
        (async () => {
            setFetching(true);
            try {
                const res = await api.get(`/users/search?prefix=${encodeURIComponent(query)}`);
                if (active) setSuggestions(res.data.slice(0, 10));
            } catch {
                if (active) setSuggestions([]);
            } finally {
                setFetching(false);
            }
        })();
        return () => { active = false; };
    }, [query]);

    const invite = async () => {
        if (!boardId || boardId <= 0) { notify("Thiếu boardId hợp lệ", "error"); return; }
        if (!selectedUser) { notify("Chọn user để mời", "warning"); return; }
        setLoading(true);
        try {
            await api.post("/boards/invite", { boardId, userId: selectedUser.id, role });
            notify("Mời thành viên thành công", "success");
            onInvited();
            onClose();
            setQuery(""); setSelectedUser(null); setSuggestions([]);
        } catch (e: any) {
            notify(e?.response?.data || e.message || "Mời thất bại", "error");
        } finally { setLoading(false); }
    };

    return (
        <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Mời thành viên</DialogTitle>
            <DialogContent dividers>
                <Stack spacing={2} mt={1}>
                    <Autocomplete
                        loading={fetching}
                        options={suggestions}
                        getOptionLabel={(o) => o.username}
                        value={selectedUser}
                        onChange={(_, v) => setSelectedUser(v)}
                        inputValue={query}
                        onInputChange={(_, v) => setQuery(v)}
                        noOptionsText={query ? "Không tìm thấy username" : "Nhập chữ cái đầu để tìm"}
                        renderOption={(props, option) => (
                            <Box component="li" {...props} key={option.id} display="flex" alignItems="center" gap={1}>
                                <Avatar sx={{ width: 28, height: 28 }}>{option.username[0]?.toUpperCase()}</Avatar>
                                <Typography>{option.username}</Typography>
                            </Box>
                        )}
                        renderInput={(params) => <TextField {...params} label="Username" placeholder="Nhập để gợi ý" />}
                    />

                    <FormControl fullWidth>
                        <InputLabel>Role</InputLabel>
                        <Select value={role} label="Role" onChange={(e) => setRole(e.target.value)}>
                            {allowedRoles.map((r) => (
                                <MenuItem key={r} value={r}>{r}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Hủy</Button>
                <Button onClick={invite} variant="contained" disabled={!selectedUser || loading}>
                    Mời
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default InviteMemberModal;