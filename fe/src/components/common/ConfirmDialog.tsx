import React from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Alert
} from "@mui/material";
import WarningIcon from "@mui/icons-material/Warning";
import { palette } from "../../theme/colors";

interface Props {
    open: boolean;
    title: string;
    content: string; // Nội dung cảnh báo
    confirmText?: string;
    cancelText?: string;
    onClose: () => void;
    onConfirm: () => void;
    loading?: boolean;
}

const ConfirmDialog: React.FC<Props> = ({
                                            open,
                                            title,
                                            content,
                                            confirmText = "Xóa",
                                            cancelText = "Hủy",
                                            onClose,
                                            onConfirm,
                                            loading = false
                                        }) => {
    return (
        <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="xs" fullWidth>
            <Box textAlign="center" pt={3}>
                <WarningIcon sx={{ fontSize: 48, color: palette.error.main }} />
            </Box>
            <DialogTitle sx={{ textAlign: "center", fontWeight: 700 }}>
                {title}
            </DialogTitle>
            <DialogContent>
                <Alert severity="error" sx={{ mb: 2, bgcolor: "#FFF5F5" }}>
                    Hành động này không thể hoàn tác!
                </Alert>
                <Typography variant="body2" color="text.secondary" textAlign="center">
                    {content}
                </Typography>
            </DialogContent>
            <DialogActions sx={{ justifyContent: "center", pb: 3, px: 3 }}>
                <Button
                    variant="outlined"
                    onClick={onClose}
                    disabled={loading}
                    sx={{ flex: 1, borderColor: palette.border.main, color: palette.text.primary }}
                >
                    {cancelText}
                </Button>
                <Button
                    variant="contained"
                    color="error"
                    onClick={onConfirm}
                    disabled={loading}
                    sx={{ flex: 1, bgcolor: palette.error.main }}
                >
                    {loading ? "Đang xử lý..." : confirmText}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ConfirmDialog;