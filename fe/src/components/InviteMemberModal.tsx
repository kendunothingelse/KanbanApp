import React, { useEffect, useState } from "react";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    TextField,
    Box,
    Typography,
} from "@mui/material";
import api from "../api";

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
                                                isOpen,
                                                onClose,
                                                boardId,
                                                onInvited,
                                                defaultRole = "MEMBER",
                                                allowedRoles = ["ADMIN", "MEMBER", "VIEWER"],
                                            }) => {
    const [query, setQuery] = useState("");
    const [selectedUser, setSelectedUser] = useState<UserSuggestion | null>(null);
    const [role, setRole] = useState(defaultRole);
    const [loading, setLoading] = useState(false);
    const [suggestions, setSuggestions] = useState<UserSuggestion[]>([]);

    useEffect(() => {
        if (!allowedRoles.includes(role)) setRole(allowedRoles[0]);
    }, [allowedRoles, role]);

    useEffect(() => {
        let ignore = false;
        const run = async () => {
            if (!query) {
                setSuggestions([]);
                return;
            }
            try {
                const res = await api.get(`/users/search?prefix=${encodeURIComponent(query)}`);
                if (!ignore) setSuggestions(res.data.slice(0, 4));
            } catch {
                if (!ignore) setSuggestions([]);
            }
        };
        run();
        return () => {
            ignore = true;
        };
    }, [query]);

    const invite = async () => {
        if (!boardId || boardId <= 0) {
            alert("Thiếu boardId hợp lệ");
            return;
        }
        if (!selectedUser) {
            alert("Chọn user để mời");
            return;
        }
        setLoading(true);
        try {
            await api.post("/boards/invite", {
                boardId,
                userId: selectedUser.id,
                role,
            });
            alert("Mời thành viên thành công");
            onInvited();
            onClose();
            setQuery("");
            setSelectedUser(null);
            setSuggestions([]);
        } catch (e: any) {
            alert(e?.response?.data || e.message || "Mời thất bại");
        } finally {
            setLoading(false);
        }
    };

    const showNoResult = query.length > 0 && suggestions.length === 0;

    return (
        <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Mời thành viên</DialogTitle>
            <DialogContent dividers>
                <Stack spacing={2} mt={1}>
                    <Box>
                        <TextField
                            fullWidth
                            label="Username (gợi ý tối đa 4)"
                            placeholder="Nhập chữ cái đầu"
                            value={query}
                            onChange={(e) => {
                                setQuery(e.target.value);
                                setSelectedUser(null);
                            }}
                        />
                        {query && (
                            <Box
                                border={1}
                                borderColor="grey.300"
                                borderRadius={1}
                                mt={1}
                                maxHeight={150}
                                overflow="auto"
                            >
                                {suggestions.map((s) => (
                                    <Box
                                        key={s.id}
                                        px={2}
                                        py={1}
                                        sx={{ cursor: "pointer", "&:hover": { bgcolor: "grey.100" } }}
                                        onClick={() => {
                                            setSelectedUser(s);
                                            setQuery(s.username);
                                        }}
                                    >
                                        {s.username}
                                    </Box>
                                ))}
                                {showNoResult && (
                                    <Typography px={2} py={1} color="error">
                                        Không tìm được tên username tương tự
                                    </Typography>
                                )}
                            </Box>
                        )}
                    </Box>
                    <FormControl fullWidth>
                        <InputLabel>Role</InputLabel>
                        <Select value={role} label="Role" onChange={(e) => setRole(e.target.value)}>
                            {allowedRoles.map((r) => (
                                <MenuItem key={r} value={r}>
                                    {r}
                                </MenuItem>
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