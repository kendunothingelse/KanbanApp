import React, { useState } from "react";
import { Box, Container, Tab, Tabs, Typography, Paper, Stack, Button, Divider, Alert, List, ListItem, ListItemText, Card, CardMedia } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import { palette } from "../theme/colors";

// ==========================================
// 1. CẤU HÌNH DỮ LIỆU & HÌNH ẢNH TẠI ĐÂY
// ==========================================

interface GuideSection {
    title: string;
    content: string[];
    image?: string; // Đường dẫn ảnh (VD: "/img/demo.gif")
    caption?: string; // Chú thích ảnh
}

const WORKSPACE_DATA: GuideSection[] = [
    {
        title: "Cách tạo & Chỉnh sửa Workspace",
        content: [
            "Bấm nút 'Tạo Workspace' ở góc trên bên phải.",
            "Nhập tên Workspace (ví dụ: 'Phòng Marketing').",
            "Để sửa hoặc xóa, bấm vào nút cài đặt bên cạnh tên Workspace trong danh sách."
        ],
        // VÍ DỤ: Thêm ảnh hướng dẫn tạo workspace
        image: "/img/DashboardCreation.gif",
        caption: "Minh họa: Các bước tạo khu vực làm việc mới"
    },
    {
        title: "Quy tắc mời thành viên",
        content: [
            "Chỉ Admin (người tạo bảng) mới có quyền mời.",
            "Nhập username chính xác của người cần mời.",
            "Phân quyền: Viewer (chỉ xem) hoặc Member (được chỉnh sửa)."
        ],
        // Có thể để trống nếu không có ảnh
    },
    {
        title: "Các lỗi thường gặp",
        content: [
            "Không thấy dự án: Kiểm tra xem bạn đang chọn đúng Workspace chưa.",
            "Không kéo được thẻ: Bạn có thể chỉ là Viewer, hãy nhờ Admin cấp quyền Member."
        ]
    }
];

const FORECAST_DATA: GuideSection[] = [
    {
        title: "1. Các thông số cốt lõi",
        content: [
            "Velocity (Tốc độ): Số điểm công việc nhóm làm được mỗi tuần.",
            "Cycle Time: Thời gian trung bình để xong 1 việc.",
            "Burndown: Biểu đồ thể hiện công việc còn lại."
        ],
        image: "/img/kpi_cards.gif",
        caption: "Các thẻ chỉ số quan trọng trong Tab Dự báo"
    },
    {
        title: "2. Cách tính toán (Logic hệ thống)",
        content: [
            "Hệ thống lấy dữ liệu 30 ngày gần nhất để tính toán.",
            "Nếu bạn vừa tạo dự án, cần hoàn thành ít nhất 1 công việc để máy bắt đầu học.",
            "Ngày dự kiến = Ngày hiện tại + (Công việc còn lại / Tốc độ trung bình)."
        ]
    },
    {
        title: "3. Cách đọc biểu đồ Burndown",
        content: [
            "Đường nét đứt: Kế hoạch lý tưởng (đều đặn).",
            "Vùng màu: Thực tế đang diễn ra.",
            "Nếu vùng màu nằm TRÊN đường nét đứt => Đang bị CHẬM tiến độ."
        ],
        image: "/img/burndown_chart.gif",
        caption: "Cách đọc biểu đồ Burndown: So sánh Thực tế vs Lý tưởng"
    },
    {
        title: "4. Cách đọc biểu đồ Velocity",
        content: [
            "Mỗi cột đại diện cho một tuần làm việc.",
            "Cột càng cao => Tuần đó làm việc càng hiệu quả.",
            "Đường ngang nét đứt thể hiện mức trung bình của nhóm."
        ],
        image: "/img/velocity_chart.gif",
        caption: "Biểu đồ năng suất làm việc theo tuần"
    }
];

// ==========================================
// 2. COMPONENT HIỂN THỊ (KHÔNG CẦN SỬA)
// ==========================================

const GuidePage: React.FC = () => {
    const nav = useNavigate();
    const [tab, setTab] = useState(0);

    // Component con để render từng mục
    const renderSections = (sections: GuideSection[]) => (
        <Box>
            {sections.map((section, idx) => (
                <Box key={idx} mb={5}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom color="primary.main" sx={{ borderLeft: `4px solid ${palette.secondary.main}`, pl: 1.5 }}>
                        {section.title}
                    </Typography>

                    <List dense sx={{ mb: 2 }}>
                        {section.content.map((line, i) => (
                            <ListItem key={i} alignItems="flex-start" sx={{ pl: 0 }}>
                                <ListItemText
                                    primary={`• ${line}`}
                                    primaryTypographyProps={{ style: { whiteSpace: 'pre-line', fontSize: '15px' } }}
                                />
                            </ListItem>
                        ))}
                    </List>

                    {/* Logic hiển thị ảnh: Nếu có đường dẫn image thì mới hiện */}
                    {section.image && (
                        <Card variant="outlined" sx={{ bgcolor: "grey.50", maxWidth: 700, mx: "auto", mt: 2 }}>
                            <CardMedia
                                component="img"
                                image={section.image}
                                alt={section.caption}
                                sx={{
                                    maxHeight: 400,
                                    objectFit: "contain",
                                    p: 1,
                                    borderBottom: "1px solid #eee"
                                }}
                            />
                            {section.caption && (
                                <Box p={1.5} textAlign="center">
                                    <Typography variant="caption" color="text.secondary" fontStyle="italic">
                                        {section.caption}
                                    </Typography>
                                </Box>
                            )}
                        </Card>
                    )}
                    <Divider sx={{ mt: 4, opacity: 0.5 }} />
                </Box>
            ))}
        </Box>
    );

    return (
        <Box minHeight="100vh" bgcolor={palette.background.default} pb={10}>
            {/* Header */}
            <Paper elevation={0} sx={{ p: 2, borderBottom: `1px solid ${palette.border.light}`, mb: 3, bgcolor: "white", position: "sticky", top: 0, zIndex: 10 }}>
                <Container maxWidth="lg">
                    <Stack direction="row" alignItems="center" spacing={2}>
                        <Button startIcon={<ArrowBackIcon />} onClick={() => nav(-1)} variant="outlined" size="small">
                            Quay lại Dashboard
                        </Button>
                        <Typography variant="h6" fontWeight={700}>Hướng dẫn sử dụng hệ thống</Typography>
                    </Stack>
                </Container>
            </Paper>

            <Container maxWidth="md">
                <Tabs
                    value={tab}
                    onChange={(_, v) => setTab(v)}
                    variant="fullWidth"
                    sx={{ mb: 4, bgcolor: "background.paper", borderRadius: 2, boxShadow: 1 }}
                >
                    <Tab label="1. Quản lý Workspace" sx={{ fontWeight: 600 }} />
                    <Tab label="2. Dự án & Dự báo" sx={{ fontWeight: 600 }} />
                </Tabs>

                {tab === 0 && (
                    <Box>
                        <Alert severity="info" sx={{ mb: 4 }}>
                            <b>Mẹo nhanh:</b> "Không gian làm việc" (Workspace) giống như tòa nhà văn phòng, còn "Dự án" (Board) là các phòng làm việc bên trong đó.
                        </Alert>
                        {renderSections(WORKSPACE_DATA)}
                    </Box>
                )}

                {tab === 1 && (
                    <Box>
                        <Alert severity="warning" sx={{ mb: 4 }}>
                            <b>Lưu ý quan trọng:</b> Hệ thống Dự báo cần dữ liệu thực tế. Hãy đảm bảo bạn kéo thẻ sang cột "Hoàn thành" (DONE) khi làm xong việc.
                        </Alert>
                        {renderSections(FORECAST_DATA)}
                    </Box>
                )}
            </Container>
        </Box>
    );
};

export default GuidePage;