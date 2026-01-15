import React, { useState, useEffect } from "react";
import { Dialog, DialogActions, Button, Typography, Box, Stepper, Step, StepLabel } from "@mui/material";
import { palette } from "../theme/colors";

const steps = [
    {
        title: "Chào mừng đến bàn làm việc!",
        content: "Đây là nơi quản lý toàn bộ công việc của bạn. Hãy coi đây là 'Sảnh chính' của văn phòng ảo.",
    },
    {
        title: "Khu vực làm việc (Workspace)",
        content: "Giống như các 'Phòng ban' (Kế toán, Marketing...). Bạn dùng nó để nhóm các dự án liên quan lại với nhau.",
    },
    {
        title: "Dự án / Bảng (Board)",
        content: "Đây là các bảng công việc cụ thể nằm trong Khu vực làm việc. Ví dụ: 'Quyết toán Q1' nằm trong nhóm 'Kế toán'.",
    },
    {
        title: "Bắt đầu ngay",
        content: "Tạo một Khu vực làm việc mới, sau đó tạo Dự án đầu tiên của bạn để bắt đầu giao việc nhé!",
    }
];

const WorkspaceTour: React.FC = () => {
    const [open, setOpen] = useState(false);
    const [activeStep, setActiveStep] = useState(0);

    useEffect(() => {
        const hasSeenTour = localStorage.getItem("hasSeenWorkspaceTour");
        if (!hasSeenTour) {
            setOpen(true);
        }
    }, []);

    const handleNext = () => {
        if (activeStep === steps.length - 1) {
            handleClose();
        } else {
            setActiveStep((prev) => prev + 1);
        }
    };

    const handleClose = () => {
        setOpen(false);
        localStorage.setItem("hasSeenWorkspaceTour", "true");
    };

    return (
        <Dialog open={open} maxWidth="xs" fullWidth>
            <Box p={3} textAlign="center">
                <Typography variant="h6" fontWeight="bold" color={palette.primary.main} gutterBottom>
                    {steps[activeStep].title}
                </Typography>
                <Box height={100} display="flex" alignItems="center" justifyContent="center">
                    <Typography color="text.secondary">
                        {steps[activeStep].content}
                    </Typography>
                </Box>

                <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
                    {steps.map((_, index) => (
                        <Step key={index}><StepLabel /></Step>
                    ))}
                </Stepper>
            </Box>
            <DialogActions sx={{ justifyContent: "space-between", px: 3, pb: 3 }}>
                <Button onClick={handleClose} color="inherit">Bỏ qua</Button>
                <Button variant="contained" onClick={handleNext} sx={{ bgcolor: palette.primary.main }}>
                    {activeStep === steps.length - 1 ? "Đã hiểu" : "Tiếp theo"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default WorkspaceTour;