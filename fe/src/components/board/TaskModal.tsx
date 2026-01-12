import React, { useState, useEffect, useCallback } from "react";
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, Stack, FormControl, InputLabel,
    Select, MenuItem, Typography,
} from "@mui/material";
import { Card as CardType, Status } from "../../types";
import { useNotification } from "../NotificationProvider";
import { palette } from "../../theme/colors";

const STATUSES: Status[] = ["TODO", "IN_PROGRESS", "DONE"];

interface TaskModalProps {
    open: boolean;
    onClose: () => void;
    editingCard:  CardType | null;
    projectDeadline: string | null;
    onSave: (card:  Partial<CardType>, formData: TaskFormData) => Promise<void>;
}

export interface TaskFormData {
    dueDateInput: string;
    priorityInput: string;
    selectedStatus: Status;
    estimateHours: string;
    actualHours: string;
}

const TaskModal:  React.FC<TaskModalProps> = ({
                                                  open,
                                                  onClose,
                                                  editingCard,
                                                  projectDeadline,
                                                  onSave,
                                              }) => {
    const { notify } = useNotification();
    const [card, setCard] = useState<Partial<CardType>>({});
    const [dueDateInput, setDueDateInput] = useState("");
    const [priorityInput, setPriorityInput] = useState("");
    const [selectedStatus, setSelectedStatus] = useState<Status>("TODO");
    const [estimateHours, setEstimateHours] = useState("");
    const [actualHours, setActualHours] = useState("");

    useEffect(() => {
        if (editingCard) {
            setCard(editingCard);
            setDueDateInput(editingCard. dueDate ??  "");
            setPriorityInput(editingCard.priority ?? "");
            setSelectedStatus(editingCard.status ??  "TODO");
            setEstimateHours(editingCard.estimateHours?. toString() ?? "");
            setActualHours(editingCard.actualHours?.toString() ?? "");
        } else {
            setCard({});
            setDueDateInput("");
            setPriorityInput("");
            setSelectedStatus("TODO");
            setEstimateHours("");
            setActualHours("");
        }
    }, [editingCard]);

    const validateDueDate = useCallback(() => {
        if (!dueDateInput) return true;
        if (projectDeadline && dueDateInput > projectDeadline) {
            notify("Deadline task không được vượt quá deadline dự án", "warning");
            return false;
        }
        return true;
    }, [dueDateInput, projectDeadline, notify]);

    const handleSave = async () => {
        if (!card.title) {
            notify("Nhập tiêu đề", "warning");
            return;
        }
        if (!validateDueDate()) return;

        await onSave(card, {
            dueDateInput,
            priorityInput,
            selectedStatus,
            estimateHours,
            actualHours,
        });
    };

    const handleClose = () => {
        setCard({});
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
            <DialogTitle sx={{ bgcolor: palette.background.muted }}>
                {editingCard?. id ? "Sửa task" :  "Thêm task"}
            </DialogTitle>
            <DialogContent dividers>
                <Stack spacing={2} mt={1}>
                    <TextField
                        label="Tiêu đề"
                        value={card.title ??  ""}
                        onChange={(e) => setCard((p) => ({ ...p, title: e. target.value }))}
                        fullWidth
                        required
                    />
                    <TextField
                        label="Mô tả"
                        value={card. description ?? ""}
                        onChange={(e) => setCard((p) => ({ ...p, description: e.target.value }))}
                        fullWidth
                        multiline
                        rows={2}
                    />
                    <FormControl fullWidth>
                        <InputLabel>Trạng thái</InputLabel>
                        <Select
                            value={selectedStatus}
                            label="Trạng thái"
                            onChange={(e) => setSelectedStatus(e.target.value as Status)}
                        >
                            {STATUSES.map((s) => (
                                <MenuItem key={s} value={s}>{s}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField
                        type="date"
                        label="Deadline"
                        InputLabelProps={{ shrink: true }}
                        value={dueDateInput}
                        helperText={
                            projectDeadline
                                ? `Không vượt quá deadline dự án: ${projectDeadline}`
                                : "Nhập deadline (tùy chọn)"
                        }
                        error={!!projectDeadline && !!dueDateInput && dueDateInput > projectDeadline}
                        onChange={(e) => setDueDateInput(e. target.value)}
                        fullWidth
                    />
                    <FormControl fullWidth>
                        <InputLabel>Ưu tiên</InputLabel>
                        <Select
                            value={priorityInput}
                            label="Ưu tiên"
                            onChange={(e) => setPriorityInput(e. target.value)}
                        >
                            <MenuItem value="">Không chọn</MenuItem>
                            <MenuItem value="LOW">LOW</MenuItem>
                            <MenuItem value="MEDIUM">MEDIUM</MenuItem>
                            <MenuItem value="HIGH">HIGH</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField
                        label="Estimate hours"
                        type="number"
                        value={estimateHours}
                        onChange={(e) => setEstimateHours(e.target. value)}
                        inputProps={{ min: 0 }}
                        fullWidth
                    />
                    <TextField
                        label="Actual hours"
                        type="number"
                        value={actualHours}
                        onChange={(e) => setActualHours(e.target.value)}
                        inputProps={{ min: 0 }}
                        fullWidth
                    />
                    {editingCard?.createdAt && (
                        <Typography variant="body2" color="text.secondary">
                            Ngày tạo: {editingCard.createdAt.slice(0, 10)}
                        </Typography>
                    )}
                </Stack>
            </DialogContent>
            <DialogActions sx={{ bgcolor: palette.background. muted }}>
                <Button onClick={handleClose}>Hủy</Button>
                <Button
                    variant="contained"
                    onClick={handleSave}
                    sx={{ bgcolor: palette. primary.main }}
                >
                    Lưu
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default TaskModal;