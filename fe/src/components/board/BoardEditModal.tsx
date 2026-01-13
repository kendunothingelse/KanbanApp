import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Stack, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { Board, BoardStatus } from "../../types";
import { palette } from "../../theme/colors";
import { labels } from "../../utils/labels";

interface Props {
    open: boolean;
    onClose: () => void;
    board: Board | null;
    onBoardChange: (board: Board) => void;
    onSave: () => Promise<void>;
    saving: boolean;
}

const BoardEditModal: React.FC<Props> = ({ open, onClose, board, onBoardChange, onSave, saving }) => {
    if (!board) return null;
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle sx={{ bgcolor: palette.background.muted }}>Sửa {labels.board}</DialogTitle>
            <DialogContent dividers>
                <Stack spacing={2} mt={1}>
                    <TextField label={`Tên ${labels.board}`} value={board.name ?? ""} onChange={(e) => onBoardChange({ ...board, name: e.target.value })} fullWidth />
                    <FormControl fullWidth>
                        <InputLabel>Trạng thái</InputLabel>
                        <Select value={board.status ?? "IN_PROGRESS"} label="Trạng thái" onChange={(e) => onBoardChange({ ...board, status: e.target.value as BoardStatus })}>
                            <MenuItem value="IN_PROGRESS">Đang làm</MenuItem>
                            <MenuItem value="DONE">Hoàn thành</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField type="date" label="Hạn dự án" InputLabelProps={{ shrink: true }} value={board.endDate ?? ""} onChange={(e) => onBoardChange({ ...board, endDate: e.target.value })} fullWidth />
                    <TextField
                        label={`${labels.wipLimit} (cột Đang làm)`}
                        type="number"
                        inputProps={{ min: 0 }}
                        value={board.wipLimit ?? ""}
                        onChange={(e) => onBoardChange({ ...board, wipLimit: e.target.value === "" ? null : Number(e.target.value) })}
                        fullWidth
                    />
                </Stack>
            </DialogContent>
            <DialogActions sx={{ bgcolor: palette.background.muted }}>
                <Button onClick={onClose}>Hủy</Button>
                <Button variant="contained" onClick={onSave} disabled={saving} sx={{ bgcolor: palette.secondary.main }}>
                    {saving ? "Đang lưu..." : "Lưu"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default BoardEditModal;