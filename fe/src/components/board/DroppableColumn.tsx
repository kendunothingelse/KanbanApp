import React from "react";
import { Box } from "@mui/material";
import { useDroppable } from "@dnd-kit/core";
import { Status } from "../../types";

type Props = {
    status: Status;
    children: React.ReactNode;
};

const DroppableColumn: React.FC<Props> = ({ status, children }) => {
    const { setNodeRef, isOver } = useDroppable({
        id: `col-${status}`,
        data: { type: "column", status },
    });

    return (
        <Box
            ref={setNodeRef}
            minWidth={260}
            bgcolor={isOver ? "primary.light" : "grey.100"}
            p={2}
            borderRadius={2}
            sx={{ transition: "background 150ms ease" }}
        >
            {children}
        </Box>
    );
};

export default DroppableColumn;