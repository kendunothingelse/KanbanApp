import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogActions, Button, Typography, Box, Stepper, Step, StepLabel } from "@mui/material";
import { palette } from "../../theme/colors";

// Các bước hướng dẫn
const steps = [
    {
        title: "Chào mừng bạn đến với Bảng công việc!",
        content: "Đây là nơi bạn quản lý tiến độ dự án. Giao diện được thiết kế dạng thẻ (Kanban) giúp bạn dễ dàng kéo thả công việc.",
    },
    {
        title: "Cột trạng thái (Status Columns)",
        content: "Công việc sẽ đi từ trái sang phải: 'Chưa làm' -> 'Đang làm' -> 'Hoàn thành'. Bạn chỉ cần kéo thẻ từ cột này sang cột kia để cập nhật.",
    },
    {
        title: "Tab Dự Báo (Forecast)",
        content: "Tính năng đặc biệt giúp bạn biết khi nào dự án sẽ xong dựa trên tốc độ làm việc thực tế của bạn, thay vì cảm tính.",
    },
    {
        title: "Thêm thành viên",
        content: "Đừng làm việc một mình! Mời thêm đồng nghiệp vào bảng để cùng nhau hoàn thành mục tiêu.",
    }
];

const BoardTour: React.FC = () => {
    // Kiểm tra xem user đã xem tour chưa (lưu trong localStorage)
    const [open, setOpen] = useState(false);
    const [activeStep, setActiveStep] = useState(0);

    useEffect(() => {
        const hasSeenTour = localStorage.getItem("hasSeenBoardTour");
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
        localStorage.setItem("hasSeenBoardTour", "true");
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
                    {steps.map((label, index) => (
                        <Step key={index}><StepLabel /></Step>
                    ))}
                </Stepper>
            </Box>
            <DialogActions sx={{ justifyContent: "space-between", px: 3, pb: 3 }}>
                <Button onClick={handleClose} color="inherit">Bỏ qua</Button>
                <Button variant="contained" onClick={handleNext}>
                    {activeStep === steps.length - 1 ? "Bắt đầu ngay" : "Tiếp theo"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default BoardTour;