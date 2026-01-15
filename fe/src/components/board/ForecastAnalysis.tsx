import React from "react";
import { Box, Typography, Alert, Stack } from "@mui/material";
import EmojiObjectsIcon from "@mui/icons-material/EmojiObjects";
import { palette } from "../../theme/colors";

interface Props {
    projectHealth: string | null | undefined;
    daysAheadOrBehind: number | null | undefined;
    averageVelocity: number;
    remainingPoints: number;
}

const ForecastAnalysis: React.FC<Props> = ({ projectHealth, daysAheadOrBehind, averageVelocity, remainingPoints }) => {
    // Logic "dịch" số liệu sang lời khuyên
    const getAdvice = () => {
        // Trường hợp chưa có dữ liệu làm việc
        if (averageVelocity === 0) {
            return (
                <Typography variant="body2">
                    Hệ thống chưa đủ dữ liệu để dự báo. Hãy thử hoàn thành một vài công việc (kéo thẻ sang cột <b>Hoàn thành</b>) để máy tính học tốc độ làm việc của nhóm.
                </Typography>
            );
        }

        // Trường hợp Chậm tiến độ (Delayed)
        if (projectHealth === "DELAYED") {
            const days = Math.abs(daysAheadOrBehind || 0);
            const weeksToRecover = Math.ceil(remainingPoints / averageVelocity);

            return (
                <Stack spacing={1}>
                    <Typography variant="body2">
                        ⚠️ <b>Cảnh báo nghiêm trọng:</b> Với tốc độ hiện tại, dự án sẽ trễ hạn khoảng <b>{days} ngày</b>.
                    </Typography>
                    <Box sx={{ bgcolor: 'background.paper', p: 1.5, borderRadius: 1, border: '1px dashed error.main' }}>
                        <Typography variant="caption" fontWeight="bold" display="block" mb={0.5}>
                            GỢI Ý GIẢI PHÁP KHẮC PHỤC:
                        </Typography>
                        <ul style={{ margin: "0", paddingLeft: 20, fontSize: "13px" }}>
                            <li><b>Cắt giảm công việc:</b> Loại bỏ các đầu việc không thiết yếu để giảm tải.</li>
                            <li><b>Tăng nhân sự:</b> Cần thêm người hỗ trợ để đẩy nhanh tiến độ.</li>
                            <li><b>Đàm phán lại:</b> Xin gia hạn Deadline thêm khoảng <b>{weeksToRecover} tuần</b>.</li>
                        </ul>
                    </Box>
                </Stack>
            );
        }

        // Trường hợp Có rủi ro (At Risk)
        if (projectHealth === "AT_RISK") {
            return (
                <Typography variant="body2">
                    Dự án đang rất sát nút. Bất kỳ sự chậm trễ nào (như nhân viên nghỉ ốm, phát sinh lỗi) cũng sẽ khiến bạn bị trễ hạn.
                    <br/>👉 <b>Hành động:</b> Theo dõi chặt chẽ các việc đang làm dở, ưu tiên việc quan trọng trước.
                </Typography>
            );
        }

        // Trường hợp Ổn định (On Track)
        return (
            <Typography variant="body2">
                Tuyệt vời! Đội nhóm đang làm việc rất hiệu quả và dự kiến sẽ hoàn thành sớm hơn hạn định <b>{Math.abs(daysAheadOrBehind || 0)} ngày</b>.
                <br/>👉 Hãy duy trì nhịp độ này và đừng chủ quan.
            </Typography>
        );
    };

    // Xác định màu sắc và icon dựa trên sức khỏe dự án
    const getSeverity = () => {
        if (projectHealth === "DELAYED") return "error";
        if (projectHealth === "AT_RISK") return "warning";
        return "success";
    };

    const borderColor = projectHealth === "DELAYED" ? palette.error.main
        : projectHealth === "AT_RISK" ? palette.warning.main
            : palette.success.main;

    return (
        <Box mb={3}>
            <Alert
                icon={<EmojiObjectsIcon fontSize="inherit" />}
                severity={getSeverity()}
                sx={{
                    border: `1px solid ${borderColor}`,
                    alignItems: "flex-start",
                    "& .MuiAlert-message": { width: "100%" } // Đảm bảo nội dung full chiều rộng
                }}
            >
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ textDecoration: "underline" }}>
                    Phân tích từ Trợ lý ảo:
                </Typography>
                {getAdvice()}
            </Alert>
        </Box>
    );
};

export default ForecastAnalysis;