import React from "react";
import { Paper, Typography, Stack, Button, Box } from "@mui/material";
import { defaultAnimateLayoutChanges, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card as CardType } from "../../types";

type Props = {
    card: CardType;
    onEdit: (card: CardType) => void;
    onDelete: (id: number) => void;
    dragging?: boolean;
};

const CardItem: React.FC<Props> = ({ card, onEdit, onDelete, dragging }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: card.id,
        data: { type: "card", status: card.status },
        animateLayoutChanges: (args) =>
            defaultAnimateLayoutChanges({
                ...args,
                wasDragging: true,
            }),
    });

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition: transition || "transform 150ms ease, box-shadow 150ms ease, background 150ms ease",
        boxShadow: dragging || isDragging ? "0px 6px 16px rgba(0,0,0,0.15)" : "0px 1px 4px rgba(0,0,0,0.08)",
        opacity: dragging || isDragging ? 0.9 : 1,
    };

    return (
        <Paper
            ref={setNodeRef}
            style={style}
            variant="outlined"
            sx={{ p: 1.5, bgcolor: "background.paper" }}
            {...attributes}
            {...listeners}
        >
            <Typography variant="subtitle1" fontWeight={600}>
                {card.title}
            </Typography>
            {card.description && (
                <Typography variant="body2" color="text.secondary">
                    {card.description}
                </Typography>
            )}
            <Stack spacing={0.5} mt={1} fontSize={12} color="text.secondary">
                {card.priority && <Typography variant="body2">Priority: {card.priority}</Typography>}
                {card.dueDate && <Typography variant="body2">Deadline: {card.dueDate}</Typography>}
                {card.createdAt && <Typography variant="body2">Created at: {card.createdAt.slice(0, 10)}</Typography>}
                {card.estimateHours !== undefined && <Typography variant="body2">Estimate: {card.estimateHours}h</Typography>}
                {card.actualHours !== undefined && <Typography variant="body2">Actual: {card.actualHours}h</Typography>}
            </Stack>
            <Box mt={1.5} display="flex" gap={1}>
                <Button size="small" variant="contained" onClick={() => onEdit(card)}>
                    Sửa
                </Button>
                <Button size="small" variant="outlined" color="error" onClick={() => onDelete(card.id)}>
                    Xóa
                </Button>
            </Box>
        </Paper>
    );
};

export default CardItem;