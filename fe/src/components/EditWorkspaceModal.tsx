import React, { useEffect, useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Stack,
    Typography
} from "@mui/material";
import { Workspace } from "../types";
import { useNotification } from "./NotificationProvider";
import api from "../api";
import { labels } from "../utils/labels";

interface Props {
    open: boolean;
    onClose: () => void;
    workspace: Workspace | null;
    onUpdated: () => void;
}

const EditWorkspaceModal: React.FC<Props> = ({ open, onClose, workspace, onUpdated }) => {
    const { notify } = useNotification();
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);

    // Reset form khi mở modal với workspace mới
    useEffect(() => {
        if (workspace) {
            setName(workspace.name);
        }
    }, [workspace]);

    const handleSave = async () => {
        if (!workspace) return;
        if (!name.trim()) {
            notify(`Tên ${labels.workspace} không được để trống`, "warning");
            return;
        }

        setLoading(true);
        try {
            await api.put(`/workspaces/${workspace.id}`, { name: name.trim() });
            notify(`Cập nhật ${labels.workspace} thành công`, "success");
            onUpdated();
            onClose();
        } catch (e: any) {
            notify(e?.response?.data || e.message || "Lỗi cập nhật", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Sửa {labels.workspace}</DialogTitle>
            <DialogContent dividers>
                <Stack spacing={2} mt={1}>
                    <Typography variant="body2" color="text.secondary">
                        ID: #{workspace?.id}
                    </Typography>
                    <TextField
                        label={`Tên ${labels.workspace}`}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        fullWidth
                        autoFocus
                        disabled={loading}
                    />
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading}>Hủy</Button>
                <Button variant="contained" onClick={handleSave} disabled={loading}>
                    {loading ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default EditWorkspaceModal;