import React from "react";
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, Stack, FormControl, InputLabel,
    Select, MenuItem,
} from "@mui/material";
import { Board, BoardStatus } from "../../types";
import { palette } from "../../theme/colors";

interface BoardEditModalProps {
    open:  boolean;
    onClose: () => void;
    board:  Board | null;
    onBoardChange: (board: Board) => void;
    onSave: () => Promise<void>;
    saving: boolean;
}

const BoardEditModal: React. FC<BoardEditModalProps> = ({
                                                            open,
                                                            onClose,
                                                            board,
                                                            onBoardChange,
                                                            onSave,
                                                            saving,
                                                        }) => {
    if (!board) return null;

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
    <DialogTitle sx={{ bgcolor:  palette.background.muted }}>
    Sửa board
    </DialogTitle>
    <DialogContent dividers>
    <Stack spacing={2} mt={1}>
    <TextField
        label="Tên board"
    value={board.name ??  ""}
    onChange={(e) => onBoardChange({ ...board, name: e.target.value })}
    fullWidth
    />
    <FormControl fullWidth>
    <InputLabel>Trạng thái</InputLabel>
    <Select
    value={board.status ??  "IN_PROGRESS"}
    label="Trạng thái"
    onChange={(e) =>
    onBoardChange({ ...board, status: e. target.value as BoardStatus })
}
>
    <MenuItem value="IN_PROGRESS">IN PROGRESS</MenuItem>
    <MenuItem value="DONE">DONE</MenuItem>
        </Select>
        </FormControl>
        <TextField
    type="date"
    label="Deadline dự án"
    InputLabelProps={{ shrink: true }}
    value={board.endDate ?? ""}
    onChange={(e) => onBoardChange({ ... board, endDate:  e.target.value })}
    fullWidth
    />
    <TextField
        label="WIP limit (IN_PROGRESS)"
    type="number"
    inputProps={{ min: 0 }}
    value={board.wipLimit ?? ""}
    onChange={(e) =>
    onBoardChange({
        ...board,
        wipLimit: e.target.value === "" ? null : Number(e.target. value),
    })
}
    fullWidth
    />
    </Stack>
    </DialogContent>
    <DialogActions sx={{ bgcolor: palette.background.muted }}>
    <Button onClick={onClose}>Hủy</Button>
        <Button
    variant="contained"
    onClick={onSave}
    disabled={saving}
    sx={{ bgcolor:  palette.primary.main }}
>
    {saving ?  "Đang lưu..." : "Lưu"}
    </Button>
    </DialogActions>
    </Dialog>
);
};

export default BoardEditModal;