import React, { useState } from "react";
import {
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Stack,
} from "@mui/material";
import api from "../api";

const CreateWorkspaceButton: React.FC<{ onCreated: () => void }> = ({ onCreated }) => {
    const [isOpen, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);

    const createWs = async () => {
        if (!name.trim()) return;
        setLoading(true);
        try {
            await api.post("/workspaces", { name });
            alert("Đã tạo workspace");
            onCreated();
            setOpen(false);
            setName("");
        } catch (e: any) {
            alert(e?.response?.data || e.message || "Lỗi");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Button variant="outlined" onClick={() => setOpen(true)}>
                Tạo workspace
            </Button>
            <Dialog open={isOpen} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>Tạo workspace</DialogTitle>
                <DialogContent dividers>
                    <Stack mt={1}>
                        <TextField
                            placeholder="Tên workspace"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            fullWidth
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Hủy</Button>
                    <Button variant="contained" onClick={createWs} disabled={loading}>
                        Tạo
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default CreateWorkspaceButton;