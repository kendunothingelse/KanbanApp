import React from "react";
import { Paper, Typography, Stack, Button, Box, Chip, Tooltip } from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import EventIcon from "@mui/icons-material/Event";
import { defaultAnimateLayoutChanges, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card as CardType } from "../../types";
import { palette, priorityColors } from "../../theme/colors";

// FIX: Thêm projectDeadline vào interface Props
type Props = {
    card: CardType;
    projectDeadline: string | null; // Đã thêm
    onEdit: (card: CardType) => void;
    onDelete: (id: number) => void;
    dragging?: boolean;
};

const CardItem: React.FC<Props> = ({ card, projectDeadline, onEdit, onDelete, dragging }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: card.id,
        data: { type: "card", status: card.status },
        animateLayoutChanges: (args) => defaultAnimateLayoutChanges({ ...args, wasDragging: true }),
    });

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition: transition || "transform 150ms ease, box-shadow 150ms ease",
        boxShadow: dragging || isDragging ? "0px 8px 20px rgba(0,0,0,0.15)" : "0px 1px 3px rgba(0,0,0,0.1)",
        opacity: dragging || isDragging ? 0.8 : 1,
        borderColor: palette.border.light,
    };

    const getDeadlineStatus = () => {
        if (!card.dueDate) return null;
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const due = new Date(card.dueDate); due.setHours(0, 0, 0, 0);
        const diff = Math.floor((due.getTime() - today.getTime()) / 86400000);

        if (diff < 0) return { label: "Quá hạn", color: palette.accent.main };
        if (diff <= 2) return { label: "Sắp đến hạn", color: "#F0A500" }; // Cam cảnh báo
        return null;
    };
    const deadlineStatus = getDeadlineStatus();

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        // Safety Check: Xác nhận xóa
        if (window.confirm(`Bạn có chắc muốn xóa thẻ "${card.title}" không? Hành động này không thể hoàn tác.`)) {
            onDelete(card.id);
        }
    };

    return (
        <Paper
            ref={setNodeRef}
            style={style}
            variant="outlined"
            sx={{
                p: 1.5,
                bgcolor: "background.paper",
                borderLeft: card.priority ? `4px solid ${priorityColors[card.priority]}` : undefined,
                "&:hover": { boxShadow: "0px 4px 12px rgba(0,0,0,0.1)" },
                cursor: "grab",
            }}
            {...attributes}
            {...listeners}
        >
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ flex: 1, wordBreak: "break-word", color: palette.text.primary, lineHeight: 1.3 }}>
                    {card.title}
                </Typography>
                {card.priority && card.priority !== "LOW" && (
                    <Chip
                        size="small"
                        label={card.priority}
                        sx={{
                            bgcolor: priorityColors[card.priority],
                            color: "#fff",
                            fontSize: 9,
                            height: 18,
                            flexShrink: 0,
                            fontWeight: 600
                        }}
                    />
                )}
            </Stack>

            {/* Chỉ hiện tối đa 2 dòng mô tả */}
            {card.description && (
                <Typography variant="body2" color="text.secondary" mt={0.5} sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontSize: 12 }}>
                    {card.description}
                </Typography>
            )}

            {/* Icons thay vì text dài dòng */}
            <Stack direction="row" spacing={1.5} mt={1.5} alignItems="center">
                {card.dueDate && (
                    <Tooltip title={`Hạn chót: ${card.dueDate} ${deadlineStatus ? `(${deadlineStatus.label})` : ""}`}>
                        <Box display="flex" alignItems="center" color={deadlineStatus ? deadlineStatus.color : "text.secondary"}>
                            <EventIcon sx={{ fontSize: 16, mr: 0.5 }} />
                            <Typography variant="caption" fontWeight={deadlineStatus ? 700 : 400}>
                                {card.dueDate.slice(5)} {/* Chỉ hiện MM-DD cho gọn */}
                            </Typography>
                        </Box>
                    </Tooltip>
                )}

                {(card.estimateHours || card.actualHours) && (
                    <Tooltip title={`Ước tính: ${card.estimateHours || 0}h | Thực tế: ${card.actualHours || 0}h`}>
                        <Box display="flex" alignItems="center" color="text.secondary">
                            <AccessTimeIcon sx={{ fontSize: 16, mr: 0.5 }} />
                            <Typography variant="caption">
                                {card.actualHours || 0}/{card.estimateHours || 0}h
                            </Typography>
                        </Box>
                    </Tooltip>
                )}
            </Stack>

            {/* Nút thao tác ẩn, hiện khi hover hoặc bấm vào card (tùy chỉnh thêm nếu cần), ở đây giữ nguyên nhưng làm gọn */}
            <Box mt={1.5} display="flex" justifyContent="flex-end" gap={1}>
                <Button
                    size="small"
                    onClick={(e) => { e.stopPropagation(); onEdit(card); }}
                    sx={{ minWidth: 0, p: "2px 8px", fontSize: 11, color: palette.secondary.main }}
                >
                    Sửa
                </Button>
                <Button
                    size="small"
                    onClick={handleDelete}
                    sx={{ minWidth: 0, p: "2px 8px", fontSize: 11, color: palette.accent.main }}
                >
                    Xóa
                </Button>
            </Box>
        </Paper>
    );
};

export default CardItem;