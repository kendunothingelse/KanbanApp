import React from "react";
import { Box, Button, Stack } from "@mui/material";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors, closestCorners } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Card as CardType, Status } from "../../types";
import CardItem from "./CardItem";
import DroppableColumn from "./DroppableColumn";
import { palette } from "../../theme/colors";

const STATUSES: Status[] = ["TODO", "IN_PROGRESS", "DONE"];

interface Props {
    cardsByStatus: Record<Status, CardType[]>;
    wipLimit: number | null;
    projectDeadline: string | null;
    activeCard: CardType | null;
    onDragStart: (e: DragStartEvent) => void;
    onDragEnd: (e: DragEndEvent) => void;
    onAddCard: (status: Status) => void;
    onEditCard: (card: CardType) => void;
    onDeleteCard: (id: number) => void;
}

const KanbanBoard: React.FC<Props> = ({
                                          cardsByStatus, wipLimit, projectDeadline, activeCard,
                                          onDragStart, onDragEnd, onAddCard, onEditCard, onDeleteCard
                                      }) => {
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

    return (
        <Box display="flex" gap={2} alignItems="flex-start" overflow="auto" pb={2} height="100%">
            <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={onDragStart} onDragEnd={onDragEnd}>
                {STATUSES.map((status) => {
                    const colCards = cardsByStatus[status] || [];
                    return (
                        <DroppableColumn key={status} status={status} title={status} wipLimit={wipLimit} currentCount={status === "IN_PROGRESS" ? colCards.length : undefined}>
                            <Button
                                size="small"
                                variant="outlined"
                                fullWidth
                                sx={{
                                    mb: 1.5,
                                    borderStyle: 'dashed',
                                    borderColor: palette.secondary.main,
                                    color: palette.secondary.main,
                                    "&:hover": { borderColor: palette.secondary.dark, bgcolor: `${palette.secondary.light}11` }
                                }}
                                onClick={() => onAddCard(status)}
                            >
                                + Thêm thẻ mới
                            </Button>
                            <SortableContext items={colCards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
                                <Stack spacing={1.5}>
                                    {colCards.map((card) => (
                                        // FIX: Đã truyền projectDeadline đúng cách
                                        <CardItem
                                            key={card.id}
                                            card={card}
                                            projectDeadline={projectDeadline}
                                            onEdit={onEditCard}
                                            onDelete={onDeleteCard}
                                        />
                                    ))}
                                </Stack>
                            </SortableContext>
                        </DroppableColumn>
                    );
                })}
                <DragOverlay dropAnimation={{ duration: 180, easing: "cubic-bezier(0.25, 1, 0.5, 1)" }}>
                    {activeCard ? (
                        <CardItem
                            card={activeCard}
                            projectDeadline={projectDeadline}
                            onEdit={() => {}}
                            onDelete={() => {}}
                            dragging
                        />
                    ) : null}
                </DragOverlay>
            </DndContext>
        </Box>
    );
};

export default KanbanBoard;