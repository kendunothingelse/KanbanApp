import React from "react";
import { Box, Stack, Typography } from "@mui/material";
import { CardHistory } from "../../types";
import { formatToUtc7 } from "../../utils/date";

const HistoryList: React.FC<{ histories: CardHistory[] }> = ({ histories }) => (
    <Stack spacing={1} maxHeight={320} overflow="auto">
        {histories.map((h) => (
            <Box key={h.id} border={1} borderColor="grey.200" borderRadius={1} p={1.5}>
                <Typography variant="body2">
                    #{h.card.id} {h.card.title}: {h.fromStatus} → {h.toStatus} lúc {formatToUtc7(h.changeDate)}
                    {h.actor ? ` bởi ${h.actor.username}` : ""}
                </Typography>
            </Box>
        ))}
    </Stack>
);

export default HistoryList;