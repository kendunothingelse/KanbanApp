import React, {useState} from "react";
import {
    Box,
    Container,
    Tab,
    Tabs,
    Typography,
    Paper,
    Stack,
    Button,
    Divider,
    Alert,
    List,
    ListItem,
    ListItemText,
    Card,
    CardMedia,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {useNavigate} from "react-router-dom";
import {palette} from "../theme/colors";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

// Cấu trúc dữ liệu hướng dẫn
interface GuideSection {
    title: string;
    content: string[];
    image?: string;
    caption?: string;
}

// Hướng dẫn WorkspaceDashboard (toàn bộ chức năng)
const WORKSPACE_DATA: GuideSection[] = [
    {
        title: "Bắt đầu với Không gian làm việc chính",
        content: [
            "1) Tạo Workspace: Bấm nút “Tạo Khu vực làm việc” ở góc phải, nhập tên phòng ban/nhóm (VD: Phòng Marketing), lưu lại.",
            "2) Đổi tên Workspace: Bấm nút ✎ (Sửa) cạnh tên Workspace, nhập tên mới rồi Lưu.",
            "3) Xóa Workspace: Bấm nút biểu tượng thùng rác 🗑 (Xóa) cạnh tên Workspace. Lưu ý: Xóa Workspace sẽ xóa toàn bộ dự án (Board) bên trong.",
            "4) Chuyển Workspace đang xem: Nhấp chọn thẻ Workspace trong hàng danh sách trên cùng để lọc các dự án thuộc Workspace đó.",
            "5) Tìm kiếm Workspace: Dùng ô tìm kiếm phía trên danh sách Workspace để lọc nhanh theo tên.",
        ],
    },
    {
        title: "Quản lý Dự án / Bảng công việc (Board) từ Dashboard",
        content: [
            "1) Tạo Board mới: Bấm “Tạo Dự án”, chọn Workspace đích, đặt tên Board, tùy chọn mời thêm 1 người (chọn Role: ADMIN/MEMBER/VIEWER), lưu lại.",
            "2) Xem nhanh Board: Trong thẻ Board có trạng thái, tiến độ (thanh progress), thành viên, và nút xóa nhanh.",
            "3) Mở Board: Bấm vào thẻ Board để đi vào trang chi tiết (BoardPage).",
            "4) Xóa Board: Bấm biểu tượng thùng rác 🗑️ trên thẻ Board. Lưu ý dữ liệu sẽ bị xóa vĩnh viễn.",
        ],
    },
    {
        title: "Mẹo dùng Dashboard cho người không chuyên",
        content: [
            "• “Workspace” giống tòa nhà; “Board” là từng phòng làm việc bên trong.",
            "• Nếu không kéo được thẻ trong Board, có thể bạn chỉ có quyền VIEWER — nhờ ADMIN cấp quyền MEMBER.",
            "• Luôn đặt tên rõ ràng, có mô tả ngắn để mọi người dễ hiểu.",
        ],
    },
];

// Hướng dẫn BoardPage: Kanban, Dự báo, Thành viên, Lịch sử
const BOARD_DATA: GuideSection[] = [
    {
        title: "Hướng dẫn nhanh cho người không chuyên",
        content: [
            "• Mỗi tuần nên kéo thẻ đã xong sang cột “Hoàn thành” để hệ thống cập nhật tốc độ.",
            "• Nhìn cảnh báo màu ở Dự báo: Xanh (ổn), Vàng (nguy cơ), Đỏ (trễ) và làm theo gợi ý hành động.",
            "• Nếu không hiểu thuật ngữ, rê chuột vào biểu tượng (?) để đọc giải thích ngắn.",
        ],
    },
    {
        title: "Tab Kanban: Quản lý công việc hằng ngày",
        content: [
            "1) Tạo thẻ mới: Bấm “+ Thêm thẻ mới” trong cột “Chưa làm” hoặc “Đang làm”.",
            "2) Kéo thả thẻ: Giữ và kéo sang cột khác để đổi trạng thái (Chưa làm → Đang làm → Hoàn thành).",
            "3) WIP Limit (Giới hạn Đang làm): Nếu cột “Đang làm” đỏ nghĩa là quá tải; hãy hoàn thành bớt trước khi kéo thêm.",
            "4) Sửa/Xóa thẻ: Bấm “Sửa” để đổi tiêu đề, mô tả, hạn, độ ưu tiên; bấm “Xóa” để bỏ thẻ.",
            "5) Hạn công việc: Khi chọn ngày hạn, đừng vượt quá hạn dự án; hệ thống sẽ cảnh báo.",
        ],
    },
    {
        title: "Tab Dự báo (Forecast): Đọc nhanh tiến độ",
        content: [
            "1) Chỉ số chính (KPI):",
            "   • Tốc độ/tuần (Velocity): Trung bình hoàn thành bao nhiêu điểm hoặc giờ mỗi tuần.",
            "   • Số ngày/việc (Cycle Time): Mất bao lâu để xong 1 việc.",
            "   • Khối lượng còn lại: Tổng điểm/giờ công việc chưa xong.",
            "   • Hạn chót dự án: Còn bao nhiêu ngày, đã quá hạn chưa.",
            "2) Phân tích & gợi ý hành động: Khối cảnh báo màu thể hiện Đang đúng tiến độ / Có nguy cơ / Đang trễ, kèm lời khuyên cụ thể.",
            "3) Biểu đồ (có thể ẩn/hiện):",
            "   • Burndown: Vùng màu = khối lượng còn lại; đường nét đứt = kế hoạch lý tưởng. Vùng màu TRÊN đường => chậm; DƯỚI => nhanh.",
            "   • Velocity theo tuần: Cột cao = tuần làm được nhiều; đường ngang nét đứt = tốc độ trung bình; cột trồi sụt mạnh = nhịp chưa ổn định.",
            "   • Cycle Time: Mỗi cột là 1 việc đã xong, cao = mất nhiều ngày.",
            "4) Tooltip giải thích: Biểu tượng (i) cạnh tiêu đề để đọc nghĩa các thuật ngữ tiếng Anh (Velocity, Cycle Time…).",
        ],
    },
    {
        title: "Tab Thành viên",
        content: [
            "• Xem danh sách thành viên và quyền (ADMIN/MEMBER/VIEWER).",
            "• ADMIN có thể đổi quyền hoặc xóa thành viên (trừ chính mình).",
            "• Dùng để kiểm soát ai được chỉnh sửa hay chỉ được xem.",
        ],
    },
    {
        title: "Tab Lịch sử",
        content: [
            "• Ghi lại mọi thay đổi trạng thái thẻ: Ai làm, làm gì, lúc nào.",
            "• Hữu ích để truy vết khi cần kiểm tra hoặc báo cáo.",
        ],
    },

];

// Hướng dẫn sâu về Dự báo (cho tab Forecast)
const FORECAST_DATA: GuideSection[] = [
    {
        title: "Các thông số cốt lõi",
        content: [
            "• Velocity (Tốc độ): Trung bình mỗi tuần nhóm hoàn thành bao nhiêu điểm/giờ. Càng cao càng tốt.",
            "• Cycle Time: Số ngày trung bình để xong 1 việc. Càng thấp càng tốt.",
            "• Khối lượng còn lại: Bao nhiêu điểm/giờ chưa xong.",
            "• Estimated End Date: Ngày ước tính xong dự án nếu giữ tốc độ hiện tại.",
            "• Project Health: Đúng tiến độ / Nguy cơ trễ / Đang trễ.",
        ],
    },
    {
        title: "Cách hệ thống tính",
        content: [
            "1) Lấy dữ liệu 30 ngày gần nhất để tính tốc độ trung bình.",
            "2) Cần ít nhất 1 việc đã hoàn thành để máy bắt đầu học tốc độ.",
            "3) Ngày dự kiến xong = Hôm nay + (Khối lượng còn lại / Velocity trung bình).",
        ],
    },
    {
        title: "Cách đọc các biểu đồ",
        content: [
            "• Burndown: Vùng màu = khối lượng còn lại; đường nét đứt = kế hoạch lý tưởng. Vùng màu TRÊN đường => chậm; DƯỚI => nhanh.",
            "• Velocity: Mỗi cột = 1 tuần; cột cao = tuần làm được nhiều; đường ngang nét đứt = tốc độ trung bình; trồi sụt mạnh = nhịp chưa ổn định.",
            "• Cycle Time: Cột cao = việc đó tốn nhiều ngày; nhìn trung bình (đường TB) để biết mặt bằng chung.",
        ],
    },
    {
        title: "Hành động khuyến nghị (dựa trên màu cảnh báo)",
        content: [
            "• Đang trễ (Đỏ): Cắt bớt việc không thiết yếu; tăng người làm; đàm phán gia hạn.",
            "• Nguy cơ (Vàng): Ưu tiên việc quan trọng; theo sát tiến độ; tránh phát sinh ngoài kế hoạch.",
            "• Đúng tiến độ (Xanh): Duy trì nhịp, cập nhật thẻ hoàn thành đều để giữ dữ liệu chính xác.",
        ],
    },
];

const GuidePage: React.FC = () => {
    const nav = useNavigate();
    const [tab, setTab] = useState(0);

    const renderSections = (sections: GuideSection[]) => (
        <Box>
            {sections.map((section, idx) => (
                <Box key={idx} mb={5}>
                    <Typography
                        variant="h6"
                        fontWeight="bold"
                        gutterBottom
                        color="primary.main"
                        sx={{borderLeft: `4px solid ${palette.secondary.main}`, pl: 1.5}}
                    >
                        {section.title}
                    </Typography>

                    <List dense sx={{mb: 2}}>
                        {section.content.map((line, i) => (
                            <ListItem key={i} alignItems="flex-start" sx={{pl: 0}}>
                                <ListItemText
                                    primary={`• ${line}`}
                                    primaryTypographyProps={{
                                        style: {
                                            whiteSpace: "pre-line",
                                            fontSize: "15px",
                                            lineHeight: 1.6
                                        }
                                    }}
                                />
                            </ListItem>
                        ))}
                    </List>

                    {section.image && (
                        <Card variant="outlined" sx={{bgcolor: "grey.50", maxWidth: 760, mx: "auto", mt: 2}}>
                            <CardMedia
                                component="img"
                                image={section.image}
                                alt={section.caption}
                                sx={{
                                    maxHeight: 420,
                                    objectFit: "contain",
                                    p: 1,
                                    borderBottom: "1px solid #eee",
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
                    <Divider sx={{mt: 4, opacity: 0.5}}/>
                </Box>
            ))}
        </Box>
    );

    return (
        <Box minHeight="100vh" bgcolor={palette.background.default} pb={10}>
            {/* Header */}
            <Paper
                elevation={0}
                sx={{
                    p: 2,
                    borderBottom: `1px solid ${palette.border.light}`,
                    mb: 3,
                    bgcolor: "white",
                    position: "sticky",
                    top: 0,
                    zIndex: 10,
                }}
            >
                <Container maxWidth="lg">
                    <Stack direction="row" alignItems="center" spacing={2}>
                        <Button startIcon={<ArrowBackIcon/>} onClick={() => nav(-1)} variant="outlined" size="small">
                            Quay lại Dashboard
                        </Button>
                        <Typography variant="h6" fontWeight={700}>
                            Hướng dẫn sử dụng hệ thống
                        </Typography>
                    </Stack>
                </Container>
            </Paper>

            <Container maxWidth="md">
                <Tabs
                    value={tab}
                    onChange={(_, v) => setTab(v)}
                    variant="fullWidth"
                    sx={{mb: 4, bgcolor: "background.paper", borderRadius: 2, boxShadow: 1}}
                >
                    <Tab label="1. Dashboard & Workspace" sx={{fontWeight: 600}}/>
                    <Tab label="2. Board: Kanban & Dự báo" sx={{fontWeight: 600}}/>
                    <Tab label="3. Giải thích Dự báo (chi tiết)" sx={{fontWeight: 600}}/>
                </Tabs>

                {tab === 0 && (
                    <Box>
                        <Alert severity="info" sx={{mb: 4, lineHeight: 1.6}}>
                            <b>Mẹo nhanh:</b> Hãy coi “Workspace” giống như một tòa nhà; “Board” là từng căn phòng làm
                            việc. Hãy tạo Workspace trước, sau đó tạo Board ở bên trong.
                        </Alert>
                        {renderSections(WORKSPACE_DATA)}
                    </Box>
                )}

                {tab === 1 && (
                    <Box>
                        <Alert severity="warning" sx={{mb: 4, lineHeight: 1.6}}>
                            <b>Lưu ý:</b> Để dự báo chính xác, hãy kéo thẻ đã xong sang cột “Hoàn thành” thường xuyên.
                            Dữ liệu thực tế càng đầy đủ, dự báo càng đúng.
                        </Alert>
                        {renderSections(BOARD_DATA)}
                    </Box>
                )}

                {tab === 2 && (
                    <Box>
                        <Alert severity="success" sx={{mb: 4, lineHeight: 1.6}}>
                            <b>Tip:</b> Nếu thấy thuật ngữ tiếng Anh khó hiểu, di chuột vào biểu tượng <InfoOutlinedIcon
                            fontSize="small" sx={{fontSize: 16}}/> trong giao diện để xem giải thích ngắn gọn.
                        </Alert>
                        {renderSections(FORECAST_DATA)}
                    </Box>
                )}
            </Container>
        </Box>
    );
};

export default GuidePage;