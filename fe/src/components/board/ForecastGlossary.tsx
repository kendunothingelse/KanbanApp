import React from "react";
import { Box, Stack, Typography } from "@mui/material";
import { palette } from "../../theme/colors";
import { labels } from "../../utils/labels";
import HelpTooltip from "../common/HelpTooltip";

const ForecastGlossary: React.FC = () => (
    <Box mt={3} p={2.5} border={`1px solid ${palette.border.light}`} borderRadius={3} bgcolor={`${palette.secondary.light}22`}>
        <Typography variant="subtitle1" fontWeight={700} gutterBottom color="text.primary">
            📖 Giải thích nhanh (dành cho người không chuyên)
        </Typography>
        <Stack spacing={0.75} color="text.secondary" fontSize={13}>
            <Typography variant="body2">
                <b>{labels.velocity}</b> (Velocity) – tốc độ trung bình mỗi tuần nhóm hoàn thành được bao nhiêu “điểm/giờ”.
                <HelpTooltip title="Velocity là thước đo tốc độ; càng cao nghĩa là làm càng nhanh." />
            </Typography>
            <Typography variant="body2">
                <b>{labels.cycleTime}</b> (Cycle Time) – số ngày để xong một việc từ lúc tạo đến khi hoàn thành.
            </Typography>
            <Typography variant="body2">
                <b>Dự kiến hoàn thành</b> (Estimated End Date) – ngày ước tính xong toàn bộ dự án.
            </Typography>
            <Typography variant="body2">
                <b>Trạng thái dự án</b> (Project Health) – Đúng tiến độ / Nguy cơ trễ / Đang trễ.
            </Typography>
            <Typography variant="body2">
                <b>{labels.storyPoints}</b> – “điểm độ khó” hoặc số giờ ước tính của công việc.
            </Typography>
        </Stack>
    </Box>
);

export default ForecastGlossary;