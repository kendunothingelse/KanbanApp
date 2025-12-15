import React, {useEffect, useMemo, useState} from "react";
import {
    Box, Button, Flex, Heading, Input, Modal, ModalBody, ModalCloseButton, ModalContent,
    ModalFooter, ModalHeader, ModalOverlay, Stack, Text, useDisclosure, useToast, Tooltip, Avatar,
} from "@chakra-ui/react";
import {
    DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent, DragStartEvent,
    useDroppable, DragOverlay
} from "@dnd-kit/core";
import {
    arrayMove, SortableContext, useSortable, verticalListSortingStrategy, defaultAnimateLayoutChanges,
} from "@dnd-kit/sortable";
import {CSS} from "@dnd-kit/utilities";
import api from "../api";
import {Card as CardType, Column as ColumnType} from "../types";
import {useParams} from "react-router-dom";
import InviteMemberModal from "../components/InviteMemberModal";
import { useAuth } from "../auth/AuthContext";
import {getAvatarColor, getAvatarColorDifferent} from "../utils/avatarColor";

type CardProps = { card: CardType; onEdit: (c: CardType) => void; onDelete: (id: number) => void };
const CardItem: React.FC<CardProps & { dragging?: boolean }> = ({card, onEdit, onDelete, dragging}) => {
    const {attributes, listeners, setNodeRef, transform, transition, isDragging} = useSortable({
        id: card.id,
        data: {type: "card", columnId: card.column?.id ?? card.column},
        animateLayoutChanges: (args) =>
            defaultAnimateLayoutChanges({
                ...args,
                wasDragging: true, // luôn animate khi thay đổi
            }),
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition: transition || "transform 150ms ease, box-shadow 150ms ease, background 150ms ease",
        boxShadow: (dragging || isDragging) ? "lg" : "sm",
        opacity: (dragging || isDragging) ? 0.9 : 1,
    };

    return (
        <Box
            ref={setNodeRef}
            style={style}
            borderWidth="1px"
            borderRadius="md"
            p="3"
            bg="white"
            {...attributes}
            {...listeners}
        >
            <Heading size="sm">{card.title}</Heading>
            {card.description && <Text fontSize="sm">{card.description}</Text>}
            <Flex mt="2" gap="2">
                <Button size="xs" onClick={() => onEdit(card)}>Sửa</Button>
                <Button size="xs" colorScheme="red" variant="outline" onClick={() => onDelete(card.id)}>Xóa</Button>
            </Flex>
        </Box>
    );
};

type ColumnDroppableProps = { columnId: number; children: React.ReactNode };
const ColumnDroppable: React.FC<ColumnDroppableProps> = ({columnId, children}) => {
    const {setNodeRef} = useDroppable({
        id: `column-${columnId}`,
        data: {type: "column", columnId},
    });
    return <Box ref={setNodeRef}>{children}</Box>;
};

const BoardPage: React.FC = () => {
    const {boardId} = useParams<{ boardId: string }>();
    const toast = useToast();
    const [columns, setColumns] = useState<ColumnType[]>([]);
    const [cards, setCards] = useState<CardType[]>([]);
    const [newColName, setNewColName] = useState("");
    const [editingCard, setEditingCard] = useState<CardType | null>(null);
    const cardModal = useDisclosure();
    const [activeCard, setActiveCard] = useState<CardType | null>(null);
    const { user } = useAuth();

    const [members, setMembers] = useState<{ id: number; user: { username: string } }[]>([]);
    const mainColor = getAvatarColor(user?.username); // cần import useAuth hoặc truyền username; ở đây dùng hook mới

    const loadMembers = async () => {
        try {
            const res = await api.get(`/boards/${boardId}/members`);
            setMembers(res.data);
        } catch {
            setMembers([]);
        }
    };

    const sensors = useSensors(
        useSensor(PointerSensor, {activationConstraint: {distance: 5}})
    );

    const load = async () => {
        const [colRes, cardRes] = await Promise.all([
            api.get(`/boards/${boardId}/columns`),
            api.get(`/boards/${boardId}/cards`)
        ]);
        setColumns(colRes.data);
        setCards(cardRes.data);
        await loadMembers();

    };

    useEffect(() => {
        load();
    }, [boardId]);

    const cardsByColumn = useMemo(() => {
        const map: Record<number, CardType[]> = {};
        columns.forEach(c => {
            map[c.id] = [];
        });
        cards.forEach(c => {
            const colId = c.column?.id ?? c.column;
            if (!map[colId]) map[colId] = [];
            map[colId].push(c);
        });
        Object.keys(map).forEach(k => map[Number(k)].sort((a, b) => (a.position ?? 0) - (b.position ?? 0)));
        return map;
    }, [cards, columns]);

    const addColumn = async () => {
        if (!newColName) return;
        try {
            await api.post("/columns", {boardId: Number(boardId), name: newColName, position: columns.length});
            setNewColName("");
            load();
        } catch (e: any) {
            toast({status: "error", title: "Không tạo được cột", description: e?.response?.data || e.message});
        }
    };

    const deleteColumn = async (id: number) => {
        await api.delete(`/columns/${id}`);
        load();
    };

    const saveCard = async (card: Partial<CardType> & { columnId: number }) => {
        try {
            if (card.id) {
                await api.put("/cards", {
                    id: card.id,
                    title: card.title,
                    description: card.description,
                    position: card.position,
                    dueDate: card.dueDate,
                    priority: card.priority,
                });
            } else {
                await api.post("/cards", {
                    columnId: card.columnId,
                    title: card.title,
                    description: card.description,
                    position: cardsByColumn[card.columnId]?.length || 0,
                    dueDate: card.dueDate,
                    priority: card.priority,
                });
            }
            cardModal.onClose();
            setEditingCard(null);
            load();
        } catch (e: any) {
            toast({status: "error", title: "Lỗi lưu thẻ", description: e?.response?.data || e.message});
        }
    };

    const deleteCard = async (id: number) => {
        await api.delete(`/cards/${id}`);
        load();
    };

    const handleDragStart = (event: DragStartEvent) => {
        const id = Number(event.active.id);
        const found = cards.find(c => c.id === id) || null;
        setActiveCard(found);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const {active, over} = event;
        setActiveCard(null);
        if (!over) return;

        const activeId = Number(active.id);
        const sourceCard = cards.find(c => c.id === activeId);
        if (!sourceCard) return;

        const sourceColId = sourceCard.column?.id ?? sourceCard.column;
        let targetColId = sourceColId;
        let targetIndex = 0;

        const overData = over.data?.current as any;
        if (overData?.type === "card") {
            targetColId = overData.columnId;
            const colCards = cardsByColumn[targetColId] || [];
            const overIndex = colCards.findIndex(c => c.id === Number(over.id));
            targetIndex = overIndex >= 0 ? overIndex : colCards.length;
        } else if (overData?.type === "column") {
            targetColId = overData.columnId;
            const colCards = cardsByColumn[targetColId] || [];
            targetIndex = colCards.length;
        }

        if (targetColId === sourceColId) {
            const colCards = cardsByColumn[sourceColId] || [];
            const oldIndex = colCards.findIndex(c => c.id === activeId);
            if (oldIndex === targetIndex) return;
        }

        try {
            await api.post("/cards/move", {
                cardId: activeId,
                targetColumnId: targetColId,
                targetPosition: targetIndex,
            });
            load();
        } catch (e: any) {
            toast({status: "error", title: "Di chuyển thất bại", description: e?.response?.data || e.message});
        }
    };

    const inviteModal = useDisclosure();
    const renderMembers = () => {
        if (!members.length) return null;
        const firstTwo = members.slice(0, 2);
        const extra = members.length - firstTwo.length;
        return (
            <Flex align="center" gap="1" mr="3">
                {firstTwo.map(m => (
                    <Tooltip key={m.id} label={m.user.username} hasArrow>
                        <Avatar
                            size="sm"
                            name={m.user.username}
                            bg={getAvatarColorDifferent(m.user.username, mainColor)}
                            color="white"
                        />
                    </Tooltip>
                ))}
                {extra > 0 && (
                    <Tooltip label={members.slice(2).map(m => m.user.username).join(", ")} hasArrow>
                        <Text fontSize="sm" color="gray.600">và còn +{extra} người khác</Text>
                    </Tooltip>
                )}
            </Flex>
        );
    };
    return (
        <Box p="6" bg="gray.50" minH="100vh">
            <Flex justify="space-between" align="center" mb="4">
                {/*Header*/}
                <Heading size="lg">Board #{boardId}</Heading>
                <Flex align="center" gap="2">
                    {renderMembers()}
                </Flex>
                <Flex gap="2">
                    <Button onClick={() => inviteModal.onOpen()}>Mời thành viên</Button>
                    <Input placeholder="Tên cột mới" value={newColName} onChange={(e) => setNewColName(e.target.value)}
                           width="200px"/>
                    <Button onClick={addColumn}>Thêm cột</Button>
                </Flex>

            </Flex>

            <Flex gap="4" align="flex-start" overflowX="auto">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                >
                    {columns.map(col => (
                        <Box key={col.id} minW="260px" bg="gray.100" p="3" borderRadius="md">
                            <Flex justify="space-between" mb="2">
                                <Heading size="sm">{col.name}</Heading>
                                <Button size="xs" variant="ghost" colorScheme="red"
                                        onClick={() => deleteColumn(col.id)}>X</Button>
                            </Flex>
                            <Button size="xs" mb="2" onClick={() => {
                                setEditingCard({} as CardType);
                                cardModal.onOpen();
                            }}>
                                + Thêm task
                            </Button>

                            <ColumnDroppable columnId={col.id}>
                                <SortableContext
                                    items={(cardsByColumn[col.id] || []).map(c => c.id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    <Stack spacing="2">
                                        {(cardsByColumn[col.id] || []).map(c => (
                                            <CardItem
                                                key={c.id}
                                                card={c}
                                                onEdit={(c) => {
                                                    setEditingCard(c);
                                                    cardModal.onOpen();
                                                }}
                                                onDelete={deleteCard}
                                            />
                                        ))}
                                    </Stack>
                                </SortableContext>
                            </ColumnDroppable>
                        </Box>
                    ))}

                    {/* Drag overlay for smoother visual feedback */}
                    <DragOverlay dropAnimation={{
                        duration: 180,
                        easing: "cubic-bezier(0.25, 1, 0.5, 1)"
                    }}>
                        {activeCard ? (
                            <CardItem
                                card={activeCard}
                                onEdit={() => {
                                }}
                                onDelete={() => {
                                }}
                                dragging
                            />
                        ) : null}
                    </DragOverlay>
                </DndContext>
            </Flex>

            <Modal isOpen={cardModal.isOpen} onClose={() => {
                cardModal.onClose();
                setEditingCard(null);
            }}>
                <ModalOverlay/>
                <ModalContent>
                    <ModalHeader>{editingCard?.id ? "Sửa task" : "Thêm task"}</ModalHeader>
                    <ModalCloseButton/>
                    <ModalBody>
                        <Stack spacing="3">
                            <Input
                                placeholder="Tiêu đề"
                                value={editingCard?.title ?? ""}
                                onChange={(e) => setEditingCard(prev => ({
                                    ...(prev || {} as any),
                                    title: e.target.value
                                }))}
                            />
                            <Input
                                placeholder="Mô tả"
                                value={editingCard?.description ?? ""}
                                onChange={(e) => setEditingCard(prev => ({
                                    ...(prev || {} as any),
                                    description: e.target.value
                                }))}
                            />
                        </Stack>
                    </ModalBody>
                    <ModalFooter>
                        <Button mr={3} variant="ghost" onClick={cardModal.onClose}>Hủy</Button>
                        <Button
                            colorScheme="blue"
                            onClick={() => {
                                if (!editingCard?.title) {
                                    toast({status: "warning", title: "Nhập tiêu đề"});
                                    return;
                                }
                                const colId = editingCard?.column?.id ?? columns[0]?.id;
                                if (!colId) {
                                    toast({status: "error", title: "Chưa có cột"});
                                    return;
                                }
                                saveCard({...editingCard, columnId: colId});
                            }}
                        >
                            Lưu
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
            <InviteMemberModal
                isOpen={inviteModal.isOpen}
                onClose={inviteModal.onClose}
                boardId={Number(boardId)}
                onInvited={loadMembers}
            />
        </Box>
    );
};

export default BoardPage;