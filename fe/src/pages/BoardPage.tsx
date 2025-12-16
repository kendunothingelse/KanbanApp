import React, {useEffect, useMemo, useRef, useState} from "react";
import {
    Box, Button, Flex, Heading, Input, Modal, ModalBody, ModalCloseButton, ModalContent,
    ModalFooter, ModalHeader, ModalOverlay, Stack, Text, useDisclosure, useToast, Tooltip, Avatar, Select,
    Tabs, TabList, TabPanels, Tab, TabPanel, AlertDialog, AlertDialogOverlay, AlertDialogContent,
    AlertDialogHeader, AlertDialogBody, AlertDialogFooter
} from "@chakra-ui/react";
import {
    DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent, DragStartEvent,
    useDroppable, DragOverlay
} from "@dnd-kit/core";
import {
    SortableContext, useSortable, verticalListSortingStrategy, defaultAnimateLayoutChanges,
} from "@dnd-kit/sortable";
import {CSS} from "@dnd-kit/utilities";
import api from "../api";
import {Card as CardType, Column as ColumnType, BoardMember} from "../types";
import {useParams} from "react-router-dom";
import InviteMemberModal from "../components/InviteMemberModal";
import {useAuth} from "../auth/AuthContext";
import {getAvatarColor, getAvatarColorDifferent} from "../utils/avatarColor";
import { Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip as ChartTooltip, Legend } from "chart.js";

Chart.register(BarController, BarElement, CategoryScale, LinearScale, ChartTooltip, Legend);

type CardProps = { card: CardType; onEdit: (c: CardType) => void; onDelete: (id: number) => void };

const CardItem: React.FC<CardProps & { dragging?: boolean }> = ({card, onEdit, onDelete, dragging}) => {
    const {attributes, listeners, setNodeRef, transform, transition, isDragging} = useSortable({
        id: card.id,
        data: {type: "card", columnId: card.column?.id ?? (card.column as any)},
        animateLayoutChanges: (args) =>
            defaultAnimateLayoutChanges({
                ...args,
                wasDragging: true,
            }),
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition: transition || "transform 150ms ease, box-shadow 150ms ease, background 150ms ease",
        boxShadow: (dragging || isDragging) ? "lg" : "sm",
        opacity: (dragging || isDragging) ? 0.9 : 1,
    };

    return (
        <Box ref={setNodeRef}
             style={style}
             borderWidth="1px" borderRadius="md" p="3"
             bg="white" {...attributes} {...listeners}>
            <Heading size="sm">{card.title}</Heading>
            {card.description && <Text fontSize="sm">{card.description}</Text>}
            <Stack spacing="1" mt="2" fontSize="xs" color="gray.600">
                {card.priority && <Text>Priority: {card.priority}</Text>}
                {card.dueDate && <Text>Deadline: {card.dueDate}</Text>}
                {card.createdAt && <Text>Created at: {card.createdAt.slice(0, 10)}</Text>}
            </Stack>
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
    const [members, setMembers] = useState<BoardMember[]>([]);
    const [newColName, setNewColName] = useState("");

    const [editingCard, setEditingCard] = useState<CardType | null>(null);
    const [dueDateInput, setDueDateInput] = useState<string>("");
    const [priorityInput, setPriorityInput] = useState<string>("");

    const cardModal = useDisclosure();
    const inviteModal = useDisclosure();
    const removeModal = useDisclosure();
    const cancelRef = useRef<HTMLButtonElement | null>(null);
    const [memberToRemove, setMemberToRemove] = useState<BoardMember | null>(null);

    const [activeCard, setActiveCard] = useState<CardType | null>(null);
    const {user} = useAuth();

    const mainColor = getAvatarColor(user?.username);
    const sensors = useSensors(useSensor(PointerSensor, {activationConstraint: {distance: 5}}));

    const chartRef = useRef<Chart | null>(null);
    const chartCanvasRef = useRef<HTMLCanvasElement | null>(null);

    const loadMembers = async () => {
        try {
            const res = await api.get(`/boards/${boardId}/members`);
            setMembers(res.data);
        } catch {
            setMembers([]);
        }
    };

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
        if (editingCard) {
            setDueDateInput(editingCard.dueDate ?? "");
            setPriorityInput(editingCard.priority ?? "");
        } else {
            setDueDateInput("");
            setPriorityInput("");
        }
    }, [editingCard]);

    useEffect(() => { load(); }, [boardId]);

    const cardsByColumn = useMemo(() => {
        const map: Record<number, CardType[]> = {};
        columns.forEach(c => { map[c.id] = []; });
        cards.forEach(c => {
            const colId = c.column?.id ?? (c.column as any);
            if (!map[colId]) map[colId] = [];
            map[colId].push(c);
        });
        Object.keys(map).forEach(k => map[Number(k)].sort((a, b) => (a.position ?? 0) - (b.position ?? 0)));
        return map;
    }, [cards, columns]);

    useEffect(() => {
        const ctx = chartCanvasRef.current;
        if (!ctx) return;
        const labels = columns.map(c => c.name);
        const data = columns.map(c => (cardsByColumn[c.id] || []).length);
        if (chartRef.current) chartRef.current.destroy();
        chartRef.current = new Chart(ctx, {
            type: "bar",
            data: {
                labels,
                datasets: [{
                    label: "Số task",
                    data,
                    backgroundColor: "rgba(66,153,225,0.6)",
                    borderColor: "rgba(66,153,225,1)",
                    borderWidth: 1,
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: true }, tooltip: { enabled: true } },
                scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
                animation: { duration: 250, easing: "easeOutCubic" }
            }
        });
    }, [columns, cardsByColumn]);

    const meUsername = user?.username;
    const myMember = members.find(m => m.user.username === meUsername);
    const myRole = myMember?.role ?? "VIEWER";
    const isAdmin = myRole === "ADMIN";
    const isMember = myRole === "MEMBER";
    const isViewer = myRole === "VIEWER";

    const guard = (allowed: boolean, label: string, node: React.ReactNode) =>
        allowed ? node : (
            <Tooltip label={label} hasArrow>
                <Box cursor="not-allowed" display="inline-block">
                    {React.cloneElement(node as any, { isDisabled: true })}
                </Box>
            </Tooltip>
        );

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
                    dueDate: dueDateInput || null,
                    priority: priorityInput || null,
                });
            } else {
                await api.post("/cards", {
                    columnId: card.columnId,
                    title: card.title,
                    description: card.description,
                    position: cardsByColumn[card.columnId]?.length || 0,
                    dueDate: dueDateInput || null,
                    priority: priorityInput || null,
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

        const sourceColId = sourceCard.column?.id ?? (sourceCard.column as any);
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

    const renderMembers = () => {
        if (!members.length) return null;
        const firstTwo = members.slice(0, 2);
        const extra = members.length - firstTwo.length;
        return (
            <Flex align="center" gap="1" mr="3">
                {firstTwo.map(m => (
                    <Tooltip key={m.id} label={`${m.user.username} (${m.role})`} hasArrow>
                        <Avatar
                            size="sm"
                            name={m.user.username}
                            bg={getAvatarColorDifferent(m.user.username, mainColor)}
                            color="white"
                        />
                    </Tooltip>
                ))}
                {extra > 0 && (
                    <Tooltip label={members.slice(2).map(m => `${m.user.username} (${m.role})`).join(", ")} hasArrow>
                        <Text fontSize="sm" color="gray.600">và còn +{extra} người khác</Text>
                    </Tooltip>
                )}
            </Flex>
        );
    };

    const confirmRemove = async () => {
        if (!memberToRemove) return;
        try {
            await api.post("/boards/remove-member", { boardId: Number(boardId), userId: memberToRemove.user.id });
            toast({ status: "success", title: "Đã xóa thành viên" });
            await loadMembers();
        } catch (e:any) {
            toast({ status: "error", title: "Xóa thất bại", description: e?.response?.data || e.message });
        } finally {
            removeModal.onClose();
            setMemberToRemove(null);
        }
    };

    const membersList = (
        <Stack spacing="2">
            {members.map(m => (
                <Flex key={m.id} align="center" justify="space-between" borderWidth="1px" borderRadius="md" p="2">
                    <Text>{m.user.username} ({m.role})</Text>
                    {isAdmin && m.user.username !== meUsername && (
                        <Button size="xs" colorScheme="red" onClick={() => { setMemberToRemove(m); removeModal.onOpen(); }}>
                            Xóa
                        </Button>
                    )}
                </Flex>
            ))}
        </Stack>
    );

    return (
        <Box p="6" bg="gray.50" minH="100vh">
            <Flex justify="space-between" align="center" mb="4" gap="4" flexWrap="wrap">
                <Heading size="lg">Board #{boardId}</Heading>
                <Flex align="center" gap="2">{renderMembers()}</Flex>
                <Flex gap="2" align="center" flexWrap="wrap">
                    {guard(isAdmin, "Chỉ dành cho ADMIN tạo ra dự án này",
                        <Button onClick={() => inviteModal.onOpen()}>Mời thành viên</Button>
                    )}
                    {guard(isAdmin || isMember, "Chỉ dành cho ADMIN tạo ra dự án này",
                        <Input placeholder="Tên cột mới" value={newColName} onChange={(e) => setNewColName(e.target.value)} width="200px"/>
                    )}
                    {guard(isAdmin || isMember, "Chỉ dành cho ADMIN tạo ra dự án này",
                        <Button onClick={addColumn}>Thêm cột</Button>
                    )}
                </Flex>
            </Flex>

            <Tabs colorScheme="blue" variant="enclosed">
                <TabList>
                    <Tab>Kanban</Tab>
                    <Tab>Biểu đồ</Tab>
                    <Tab>Thành viên</Tab>
                </TabList>
                <TabPanels>
                    <TabPanel px="0">
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
                                            {guard(isAdmin || isMember, "Chỉ dành cho ADMIN tạo ra dự án này",
                                                <Button size="xs" variant="ghost" colorScheme="red"
                                                        onClick={() => deleteColumn(col.id)}>X</Button>
                                            )}
                                        </Flex>
                                        {guard(isAdmin || isMember, "Chỉ dành cho ADMIN tạo ra dự án này",
                                            <Button size="xs" mb="2" onClick={() => { setEditingCard({} as CardType); cardModal.onOpen(); }}>
                                                + Thêm task
                                            </Button>
                                        )}
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
                                                            onEdit={(c) => { setEditingCard(c); cardModal.onOpen(); }}
                                                            onDelete={deleteCard}
                                                        />
                                                    ))}
                                                </Stack>
                                            </SortableContext>
                                        </ColumnDroppable>
                                    </Box>
                                ))}

                                <DragOverlay dropAnimation={{ duration: 180, easing: "cubic-bezier(0.25, 1, 0.5, 1)" }}>
                                    {activeCard ? (
                                        <CardItem card={activeCard} onEdit={() => {}} onDelete={() => {}} dragging />
                                    ) : null}
                                </DragOverlay>
                            </DndContext>
                        </Flex>
                    </TabPanel>

                    <TabPanel>
                        <Box maxW="720px">
                            <canvas ref={chartCanvasRef} />
                        </Box>
                    </TabPanel>

                    <TabPanel>
                        {membersList}
                    </TabPanel>
                </TabPanels>
            </Tabs>

            <Modal isOpen={cardModal.isOpen} onClose={() => { cardModal.onClose(); setEditingCard(null); }}>
                <ModalOverlay/>
                <ModalContent>
                    <ModalHeader>{editingCard?.id ? "Sửa task" : "Thêm task"}</ModalHeader>
                    <ModalCloseButton/>
                    <ModalBody>
                        <Stack spacing="3">
                            <Input
                                placeholder="Tiêu đề"
                                value={editingCard?.title ?? ""}
                                onChange={(e) => setEditingCard(prev => ({ ...(prev || {} as any), title: e.target.value }))}
                            />
                            <Input
                                placeholder="Mô tả"
                                value={editingCard?.description ?? ""}
                                onChange={(e) => setEditingCard(prev => ({ ...(prev || {} as any), description: e.target.value }))}
                            />
                            <Input
                                type="date"
                                placeholder="Deadline"
                                value={dueDateInput}
                                onChange={(e) => setDueDateInput(e.target.value)}
                            />
                            <Select
                                placeholder="Ưu tiên"
                                value={priorityInput}
                                onChange={(e) => setPriorityInput(e.target.value)}
                            >
                                <option value="LOW">LOW</option>
                                <option value="MEDIUM">MEDIUM</option>
                                <option value="HIGH">HIGH</option>
                            </Select>
                            {editingCard?.createdAt && (
                                <Text fontSize="sm" color="gray.500">
                                    Ngày tạo: {editingCard.createdAt.slice(0, 10)}
                                </Text>
                            )}
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
                                if (!colId) { toast({status: "error", title: "Chưa có cột"}); return; }
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

            <AlertDialog
                isOpen={removeModal.isOpen}
                leastDestructiveRef={cancelRef}
                onClose={removeModal.onClose}
            >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader>Xóa thành viên</AlertDialogHeader>
                        <AlertDialogBody>
                            Bạn chắc chắn muốn xóa {memberToRemove?.user.username} khỏi board? (Chỉ ADMIN)
                        </AlertDialogBody>
                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={removeModal.onClose}>Hủy</Button>
                            <Button colorScheme="red" ml={3} onClick={confirmRemove}>Xóa</Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </Box>
    );
};

export default BoardPage;