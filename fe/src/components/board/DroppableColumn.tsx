import React from "react";
import { Box, Chip, Stack, Typography } from "@mui/material";
import { useDroppable } from "@dnd-kit/core";
import { Status } from "../../types";
import { palette, taskStatusColors } from "../../theme/colors";

interface Props {
    status: Status;
    title?:  string;
    wipLimit?:  number | null;
    currentCount?: number;
    children: React.ReactNode;
}

const DroppableColumn:  React.FC<Props> = ({ status, title, wipLimit, currentCount = 0, children }) => {
    const { setNodeRef, isOver } = useDroppable({ id: `col-${status}`, data: { type: "column", status } });

    const isWipLimited = status === "IN_PROGRESS" && !!wipLimit && wipLimit > 0;
    const isFull = isWipLimited && currentCount >= (wipLimit || 0);

    const headerColor = taskStatusColors[status];
    const bgColor = isOver
        ? isFull
            ?  `${palette.accent.light}44`
            : `${palette.primary.light}66`
        : palette.background.muted;

    return (
        <Box
            ref={setNodeRef}
            minWidth={280}
            bgcolor={bgColor}
            p={2}
            borderRadius={3}
            border={`2px solid ${isFull ? palette.accent.main :  palette.border.light}`}
            sx={{ transition: "all 150ms ease" }}
        >
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
                <Stack direction="row" alignItems="center" spacing={1}>
                    <Box width={4} height={20} borderRadius={2} bgcolor={headerColor} />
                    <Typography variant="subtitle1" fontWeight={700}>
                        {title || status}
                    </Typography>
                </Stack>
                {isWipLimited && (
                    <Chip
                        size="small"
                        sx={{
                            bgcolor: isFull ? palette.accent.main :  palette.primary.main,
                            color: "#fff",
                            fontWeight: 600,
                        }}
                        label={`${currentCount}/${wipLimit}`}
                    />
                )}
            </Stack>
            {children}
        </Box>
    );
};

export default DroppableColumn;