import React from "react";
import { Box, Stack, Typography } from "@mui/material";
import { palette } from "../../theme/colors";
import { labels } from "../../utils/labels";

const ForecastGlossary: React.FC = () => (
    <Box mt={3} p={2.5} border={`1px solid ${palette.border.light}`} borderRadius={3} bgcolor={`${palette.secondary.light}22`}>
        <Typography variant="subtitle1" fontWeight={700} gutterBottom color="text.primary">
            📖 Giải thích nhanh
        </Typography>
        <Stack spacing={0.75} color="text.secondary" fontSize={13}>
            <Typography variant="body2"><b>{labels.velocity}</b>: Trung bình nhóm hoàn thành bao nhiêu việc mỗi tuần.</Typography>
            <Typography variant="body2"><b>{labels.cycleTime}</b>: Mất bao lâu để xong một công việc.</Typography>
            <Typography variant="body2"><b>Dự kiến hoàn thành</b>: Ngày ước tính xong toàn bộ dự án.</Typography>
            <Typography variant="body2"><b>Trạng thái dự án</b>: Đang đúng tiến độ / Nguy cơ trễ / Đang trễ.</Typography>
            <Typography variant="body2"><b>{labels.storyPoints}</b>: Độ khó của công việc (1 = dễ, 5 = khó).</Typography>
        </Stack>
    </Box>
);

export default ForecastGlossary;