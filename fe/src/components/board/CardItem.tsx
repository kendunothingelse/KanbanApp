import React from "react";
import { Paper, Typography, Stack, Button, Box, Chip, Tooltip } from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import EventIcon from "@mui/icons-material/Event";
import { defaultAnimateLayoutChanges, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card as CardType } from "../../types";
import { palette, priorityColors } from "../../theme/colors";

type Props = {
    card: CardType;
    projectDeadline?: string | null;
    onEdit: (card: CardType) => void;
    onDelete: (id: number) => void;
    dragging?: boolean;
};

const CardItem: React.FC<Props> = ({ card, onEdit, onDelete, dragging }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: card.id,
        data: { type: "card", status: card.status },
        animateLayoutChanges: (args) => defaultAnimateLayoutChanges({ ...args, wasDragging: true }),
    });

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition: transition || "transform 150ms ease, box-shadow 150ms ease, background 150ms ease",
        boxShadow: dragging || isDragging ? "0px 6px 16px rgba(0,0,0,0.12)" : "0px 1px 4px rgba(0,0,0,0.08)",
        opacity: dragging || isDragging ? 0.9 : 1,
    };

    const getDeadlineStatus = () => {
        if (!card.dueDate) return null;
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const due = new Date(card.dueDate); due.setHours(0, 0, 0, 0);
        const diff = Math.floor((due.getTime() - today.getTime()) / 86400000);
        if (diff < 0) return { label: "Quá hạn", color: palette.accent.main };
        if (diff <= 2) return { label: "Sắp hết hạn", color: palette.warning.main };
        return null;
    };
    const deadlineStatus = getDeadlineStatus();

    return (
        <Paper
            ref={setNodeRef}
            style={style}
            variant="outlined"
            sx={{
                p: 1.5,
                bgcolor: "background.paper",
                borderLeft: card.priority ? `4px solid ${priorityColors[card.priority]}` : undefined,
                "&:hover": { boxShadow: "0px 4px 12px rgba(0,0,0,0.12)" },
            }}
            {...attributes}
            {...listeners}
        >
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                <Typography variant="subtitle1" fontWeight={700} sx={{ flex: 1, wordBreak: "break-word", color: palette.text.primary }}>
                    {card.title}
                </Typography>
                {card.priority && (
                    <Chip
                        size="small"
                        label={card.priority}
                        sx={{
                            bgcolor: priorityColors[card.priority],
                            color: card.priority === "HIGH" ? "#fff" : palette.text.primary,
                            fontSize: 10,
                            height: 20,
                            flexShrink: 0,
                        }}
                    />
                )}
            </Stack>

            {card.description && (
                <Typography variant="body2" color="text.secondary" mt={0.5}>
                    {card.description}
                </Typography>
            )}

            <Stack spacing={0.5} mt={1} fontSize={12} color="text.secondary">
                {card.dueDate && (
                    <Typography variant="body2" color={deadlineStatus ? deadlineStatus.color : "text.secondary"}>
                        <EventIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: "middle" }} />
                        Hạn: {card.dueDate} {deadlineStatus ? `(${deadlineStatus.label})` : ""}
                    </Typography>
                )}
                {card.createdAt && (
                    <Typography variant="body2">
                        <AccessTimeIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: "middle" }} />
                        Tạo: {card.createdAt.slice(0, 10)}
                    </Typography>
                )}
                {card.estimateHours != null && (
                    <Typography variant="body2">
                        <AccessTimeIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: "middle" }} />
                        Ước tính: {card.estimateHours}h
                    </Typography>
                )}
                {card.actualHours != null && (
                    <Typography variant="body2">
                        <AccessTimeIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: "middle" }} />
                        Thực tế: {card.actualHours}h
                    </Typography>
                )}
            </Stack>

            <Box mt={1.5} display="flex" gap={1}>
                <Button
                    size="small"
                    variant="contained"
                    onClick={(e) => { e.stopPropagation(); onEdit(card); }}
                    sx={{ bgcolor: palette.secondary.main, "&:hover": { bgcolor: palette.secondary.dark } }}
                >
                    Sửa
                </Button>
                <Button
                    size="small"
                    variant="outlined"
                    onClick={(e) => { e.stopPropagation(); onDelete(card.id); }}
                    sx={{ borderColor: palette.accent.main, color: palette.accent.main, "&:hover": { borderColor: palette.accent.dark, bgcolor: `${palette.accent.main}11` } }}
                >
                    Xóa
                </Button>
            </Box>
        </Paper>
    );
};

export default CardItem;