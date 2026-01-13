import React, { useState, useEffect, useCallback } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Stack, FormControl, InputLabel, Select, MenuItem, Typography } from "@mui/material";
import { Card as CardType, Status } from "../../types";
import { useNotification } from "../NotificationProvider";
import { palette } from "../../theme/colors";
import { labels } from "../../utils/labels";

const STATUSES: Status[] = ["TODO", "IN_PROGRESS", "DONE"];

export interface TaskFormData {
    dueDateInput: string;
    priorityInput: string;
    selectedStatus: Status;
    estimateHours: string;
    actualHours: string;
}

interface Props {
    open: boolean;
    onClose: () => void;
    editingCard: CardType | null;
    projectDeadline: string | null;
    onSave: (card: Partial<CardType>, formData: TaskFormData) => Promise<void>;
}

const TaskModal: React.FC<Props> = ({ open, onClose, editingCard, projectDeadline, onSave }) => {
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
            setDueDateInput(editingCard.dueDate ?? "");
            setPriorityInput(editingCard.priority ?? "");
            setSelectedStatus(editingCard.status ?? "TODO");
            setEstimateHours(editingCard.estimateHours?.toString() ?? "");
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
            notify("Hạn công việc không được vượt quá hạn dự án", "warning");
            return false;
        }
        return true;
    }, [dueDateInput, projectDeadline, notify]);

    const handleSave = async () => {
        if (!card.title) {
            notify("Nhập tiêu đề công việc", "warning");
            return;
        }
        if (!validateDueDate()) return;
        await onSave(card, { dueDateInput, priorityInput, selectedStatus, estimateHours, actualHours });
    };

    const handleClose = () => {
        setCard({});
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
            <DialogTitle sx={{ bgcolor: palette.background.muted }}>{editingCard?.id ? "Sửa công việc" : "Thêm công việc"}</DialogTitle>
            <DialogContent dividers>
                <Stack spacing={2} mt={1}>
                    <TextField label="Tiêu đề công việc" value={card.title ?? ""} onChange={(e) => setCard((p) => ({ ...p, title: e.target.value }))} fullWidth required />
                    <TextField label="Mô tả" value={card.description ?? ""} onChange={(e) => setCard((p) => ({ ...p, description: e.target.value }))} fullWidth multiline rows={2} />
                    <FormControl fullWidth>
                        <InputLabel>Trạng thái</InputLabel>
                        <Select value={selectedStatus} label="Trạng thái" onChange={(e) => setSelectedStatus(e.target.value as Status)}>
                            <MenuItem value="TODO">Chưa làm</MenuItem>
                            <MenuItem value="IN_PROGRESS">Đang làm</MenuItem>
                            <MenuItem value="DONE">Hoàn thành</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField
                        type="date"
                        label="Hạn công việc"
                        InputLabelProps={{ shrink: true }}
                        value={dueDateInput}
                        helperText={projectDeadline ? `Không vượt quá hạn dự án: ${projectDeadline}` : "Nhập hạn (tùy chọn)"}
                        error={!!projectDeadline && !!dueDateInput && dueDateInput > projectDeadline}
                        onChange={(e) => setDueDateInput(e.target.value)}
                        fullWidth
                    />
                    <FormControl fullWidth>
                        <InputLabel>Độ ưu tiên</InputLabel>
                        <Select value={priorityInput} label="Độ ưu tiên" onChange={(e) => setPriorityInput(e.target.value)}>
                            <MenuItem value="">Không chọn</MenuItem>
                            <MenuItem value="LOW">Thấp</MenuItem>
                            <MenuItem value="MEDIUM">Trung bình</MenuItem>
                            <MenuItem value="HIGH">Cao</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField label="Ước tính (giờ)" type="number" value={estimateHours} onChange={(e) => setEstimateHours(e.target.value)} inputProps={{ min: 0 }} fullWidth />
                    <TextField label="Thực tế (giờ)" type="number" value={actualHours} onChange={(e) => setActualHours(e.target.value)} inputProps={{ min: 0 }} fullWidth />
                    {editingCard?.createdAt && (
                        <Typography variant="body2" color="text.secondary">
                            Ngày tạo: {editingCard.createdAt.slice(0, 10)}
                        </Typography>
                    )}
                </Stack>
            </DialogContent>
            <DialogActions sx={{ bgcolor: palette.background.muted }}>
                <Button onClick={handleClose}>Hủy</Button>
                <Button variant="contained" onClick={handleSave} sx={{ bgcolor: palette.secondary.main }}>
                    Lưu
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default TaskModal;