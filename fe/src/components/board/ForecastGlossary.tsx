import React from "react";
import { Box, Stack, Typography } from "@mui/material";
import { palette } from "../../theme/colors";

const ForecastGlossary: React. FC = () => (
    <Box
        mt={3}
        p={2.5}
        border={`1px solid ${palette.border. light}`}
        borderRadius={3}
        bgcolor={`${palette.secondary.light}33`}
    >
        <Typography variant="subtitle1" fontWeight={700} gutterBottom color="text.primary">
            📖 Hướng dẫn đọc chỉ số
        </Typography>
        <Stack spacing={0.75} color="text.secondary" fontSize={13}>
            <Typography variant="body2">
                <b>Velocity</b>:  Story points hoàn thành mỗi tuần (càng cao càng tốt).
            </Typography>
            <Typography variant="body2">
                <b>Cycle Time</b>:  Số ngày trung bình để hoàn thành một task.
            </Typography>
            <Typography variant="body2">
                <b>Estimated End</b>:  Ngày dự kiến hoàn thành toàn bộ dự án.
            </Typography>
            <Typography variant="body2">
                <b>Project Health</b>:  ĐÚNG TIẾN ĐỘ / NGUY CƠ TRỄ / ĐANG TRỄ.
            </Typography>
        </Stack>
    </Box>
);

export default ForecastGlossary;