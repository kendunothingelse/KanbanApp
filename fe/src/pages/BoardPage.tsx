// key updates: no columns API; fixed 3 statuses; board detail + edit; wip limit enforcement messages; history tab; back button

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    Box, Button, Flex, Heading, Input, Modal, ModalBody, ModalCloseButton,
    ModalContent, ModalFooter, ModalHeader, ModalOverlay, Stack, Text, useDisclosure,
    useToast, Tooltip, Avatar, Select, Tabs, TabList, TabPanels, Tab, TabPanel,
    Badge, IconButton, FormControl, FormLabel, NumberInput, NumberInputField
} from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import {
    DndContext, closestCenter, PointerSensor, useSensor, useSensors,
    DragEndEvent, DragStartEvent, DragOverlay
} from "@dnd-kit/core";
import {
    SortableContext, useSortable, verticalListSortingStrategy, defaultAnimateLayoutChanges
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import api from "../api";
import { Card as CardType, Status, Board, BoardMember, CardHistory } from "../types";
import { useParams, useNavigate } from "react-router-dom";
import InviteMemberModal from "../components/InviteMemberModal";
import { useAuth } from "../auth/AuthContext";
import { getAvatarColor, getAvatarColorDifferent } from "../utils/avatarColor";
import { Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip as ChartTooltip, Legend } from "chart.js";

Chart.register(BarController, BarElement, CategoryScale, LinearScale, ChartTooltip, Legend);

const STATUSES: Status[] = ["TODO", "IN_PROGRESS", "DONE"];

type CardProps = { card: CardType; onEdit: (c: CardType) => void; onDelete: (id: number) => void; dragging?: boolean };

const CardItem: React.FC<CardProps> = ({ card, onEdit, onDelete, dragging }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: card.id,
        data: { type: "card", status: card.status },
        animateLayoutChanges: (args) =>
            defaultAnimateLayoutChanges({
                ...args,
                wasDragging: true,
            }),
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition: transition || "transform 150ms ease, box-shadow 150ms ease, background 150ms ease",
        boxShadow: dragging || isDragging ? "lg" : "sm",
        opacity: dragging || isDragging ? 0.9 : 1,
    };

    return (
        <Box ref={setNodeRef} style={style} borderWidth="1px" borderRadius="md" p="3" bg="white" {...attributes} {...listeners}>
            <Heading size="sm">{card.title}</Heading>
            {card.description && <Text fontSize="sm">{card.description}</Text>}
            <Stack spacing="1" mt="2" fontSize="xs" color="gray.600">
                {card.priority && <Text>Priority: {card.priority}</Text>}
                {card.dueDate && <Text>Deadline: {card.dueDate}</Text>}
                {card.createdAt && <Text>Created at: {card.createdAt.slice(0, 10)}</Text>}
                {card.estimateHours !== undefined && <Text>Estimate: {card.estimateHours}h</Text>}
                {card.actualHours !== undefined && <Text>Actual: {card.actualHours}h</Text>}
            </Stack>
            <Flex mt="2" gap="2">
                <Button size="xs" onClick={() => onEdit(card)}>Sửa</Button>
                <Button size="xs" colorScheme="red" variant="outline" onClick={() => onDelete(card.id)}>Xóa</Button>
            </Flex>
        </Box>
    );
};

const BoardPage: React.FC = () => {
    const { boardId } = useParams<{ boardId: string }>();
    const toast = useToast();
    const nav = useNavigate();
    const [board, setBoard] = useState<Board | null>(null);
    const [cards, setCards] = useState<CardType[]>([]);
    const [members, setMembers] = useState<BoardMember[]>([]);
    const [editingCard, setEditingCard] = useState<CardType | null>(null);
    const [dueDateInput, setDueDateInput] = useState<string>("");
    const [priorityInput, setPriorityInput] = useState<string>("");
    const [estimateHours, setEstimateHours] = useState<string>("");
    const [actualHours, setActualHours] = useState<string>("");
    const [selectedStatus, setSelectedStatus] = useState<Status>("TODO");
    const [histories, setHistories] = useState<CardHistory[]>([]);

    const cardModal = useDisclosure();
    const inviteModal = useDisclosure();
    const boardEditModal = useDisclosure();
    const { user } = useAuth();

    const mainColor = getAvatarColor(user?.username);
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

    const chartRef = useRef<Chart | null>(null);
    const chartCanvasRef = useRef<HTMLCanvasElement | null>(null);

    const loadBoard = async () => {
        const res = await api.get(`/boards/${boardId}`);
        setBoard(res.data);
    };

    const loadCards = async () => {
        const res = await api.get(`/boards/${boardId}/cards`);
        setCards(res.data);
    };

    const loadMembers = async () => {
        try {
            const res = await api.get(`/boards/${boardId}/members`);
            setMembers(res.data);
        } catch {
            setMembers([]);
        }
    };

    const loadHistories = async () => {
        try {
            const res = await api.get(`/boards/${boardId}/history`);
            setHistories(res.data);
        } catch {
            setHistories([]);
        }
    };

    const loadAll = async () => {
        await Promise.all([loadBoard(), loadCards(), loadMembers(), loadHistories()]);
    };

    useEffect(() => {
        if (editingCard) {
            setDueDateInput(editingCard.dueDate ?? "");
            setPriorityInput(editingCard.priority ?? "");
            setSelectedStatus(editingCard.status);
            setEstimateHours(editingCard.estimateHours?.toString() ?? "");
            setActualHours(editingCard.actualHours?.toString() ?? "");
        } else {
            setDueDateInput("");
            setPriorityInput("");
            setEstimateHours("");
            setActualHours("");
            setSelectedStatus("TODO");
        }
    }, [editingCard]);

    useEffect(() => {
        loadAll();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [boardId]);

    const cardsByStatus = useMemo(() => {
        const map: Record<Status, CardType[]> = { TODO: [], IN_PROGRESS: [], DONE: [] };
        cards.forEach((c) => {
            map[c.status].push(c);
        });
        Object.values(map).forEach(arr => arr.sort((a, b) => (a.position ?? 0) - (b.position ?? 0)));
        return map;
    }, [cards]);

    useEffect(() => {
        const ctx = chartCanvasRef.current;
        if (!ctx) return;
        const labels = STATUSES;
        const data = STATUSES.map((s) => (cardsByStatus[s] || []).length);
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
    }, [cardsByStatus]);

    const myRole = useMemo(() => {
        const me = members.find(m => m.user.username === user?.username);
        return me?.role ?? "VIEWER";
    }, [members, user]);

    const isAdmin = myRole === "ADMIN";

    const saveCard = async (card: Partial<CardType>) => {
        try {
            if (card.id) {
                await api.put("/cards", {
                    id: card.id,
                    title: card.title,
                    description: card.description,
                    position: card.position,
                    dueDate: dueDateInput || null,
                    priority: priorityInput || null,
                    status: selectedStatus,
                    estimateHours: estimateHours ? Number(estimateHours) : null,
                    actualHours: actualHours ? Number(actualHours) : null,
                });
            } else {
                await api.post("/cards", {
                    boardId: Number(boardId),
                    title: card.title,
                    description: card.description,
                    position: cardsByStatus[selectedStatus]?.length || 0,
                    dueDate: dueDateInput || null,
                    priority: priorityInput || null,
                    status: selectedStatus,
                    estimateHours: estimateHours ? Number(estimateHours) : null,
                    actualHours: actualHours ? Number(actualHours) : null,
                });
            }
            cardModal.onClose();
            setEditingCard(null);
            loadAll();
        } catch (e: any) {
            toast({ status: "error", title: "Lỗi lưu thẻ", description: e?.response?.data || e.message });
        }
    };

    const deleteCard = async (id: number) => {
        await api.delete(`/cards/${id}`);
        loadAll();
    };

    const handleDragStart = (event: DragStartEvent) => {
        const id = Number(event.active.id);
        const found = cards.find(c => c.id === id) || null;
        setActiveCard(found);
    };

    const [activeCard, setActiveCard] = useState<CardType | null>(null);

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveCard(null);
        if (!over) return;

        const activeId = Number(active.id);
        const sourceCard = cards.find((c) => c.id === activeId);
        if (!sourceCard) return;

        let targetStatus = sourceCard.status;
        let targetIndex = 0;

        const overData = over.data?.current as any;
        if (overData?.type === "card") {
            targetStatus = overData.status as Status;
            const colCards = cardsByStatus[targetStatus] || [];
            const overIndex = colCards.findIndex((c) => c.id === Number(over.id));
            targetIndex = overIndex >= 0 ? overIndex : colCards.length;
        } else if (overData?.type === "column") {
            targetStatus = overData.status as Status;
            const colCards = cardsByStatus[targetStatus] || [];
            targetIndex = colCards.length;
        }

        try {
            await api.post("/cards/move", {
                cardId: activeId,
                targetStatus,
                targetPosition: targetIndex,
            });
            loadAll();
        } catch (e: any) {
            toast({ status: "error", title: "Di chuyển thất bại", description: e?.response?.data || e.message });
        }
    };

    const renderMembers = () => {
        if (!members.length) return null;
        const firstTwo = members.slice(0, 2);
        const extra = members.length - firstTwo.length;
        return (
            <Flex align="center" gap="1" mr="3">
                {firstTwo.map((m) => (
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
                    <Tooltip label={members.slice(2).map((m) => `${m.user.username} (${m.role})`).join(", ")} hasArrow>
                        <Text fontSize="sm" color="gray.600">và còn +{extra} người khác</Text>
                    </Tooltip>
                )}
            </Flex>
        );
    };

    const statusBadge = (status?: string) => {
        if (!status) return null;
        const color = status === "DONE" ? "green" : "yellow";
        return <Badge ml="2" colorScheme={color}>{status === "DONE" ? "DONE" : "IN PROGRESS"}</Badge>;
    };

    const updateBoard = async () => {
        if (!board) return;
        try {
            await api.put(`/boards/${board.id}`, {
                name: board.name,
                status: board.status,
                endDate: board.endDate || null,
                wipLimit: board.wipLimit ?? null,
            });
            boardEditModal.onClose();
            loadBoard();
        } catch (e: any) {
            toast({ status: "error", title: "Cập nhật board thất bại", description: e?.response?.data || e.message });
        }
    };

    return (
        <Box p="6" bg="gray.50" minH="100vh">
            <Flex justify="space-between" align="center" mb="4" gap="4" flexWrap="wrap">
                <Flex align="center" gap="2">
                    <IconButton
                        aria-label="Quay lại"
                        icon={<ArrowBackIcon />}
                        onClick={() => nav("/workspaces")}
                        variant="outline"
                    />
                    <Heading size="lg">
                        {board?.name || `Board #${boardId}`}
                        {statusBadge(board?.status)}
                    </Heading>
                </Flex>
                <Stack spacing="1" fontSize="sm" color="gray.600">
                    {board?.createdAt && <Text>Created: {board.createdAt.slice(0, 10)}</Text>}
                    {board?.endDate && <Text>End: {board.endDate}</Text>}
                    {board?.wipLimit && <Text>WIP (IN PROGRESS) limit: {board.wipLimit}</Text>}
                </Stack>
                <Flex align="center" gap="2" flexWrap="wrap">
                    {renderMembers()}
                    {isAdmin && (
                        <Button onClick={boardEditModal.onOpen} colorScheme="purple" variant="outline">
                            Sửa board
                        </Button>
                    )}
                    <Button onClick={() => inviteModal.onOpen()}>Mời thành viên</Button>
                </Flex>
            </Flex>

            <Tabs colorScheme="blue" variant="enclosed">
                <TabList>
                    <Tab>Kanban</Tab>
                    <Tab>Biểu đồ</Tab>
                    <Tab>Thành viên</Tab>
                    <Tab>Lịch sử</Tab>
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
                                {STATUSES.map((status) => (
                                    <Box key={status} minW="260px" bg="gray.100" p="3" borderRadius="md">
                                        <Flex justify="space-between" mb="2">
                                            <Heading size="sm">{status}</Heading>
                                        </Flex>
                                        <Button
                                            size="xs"
                                            mb="2"
                                            onClick={() => {
                                                setEditingCard({} as CardType);
                                                setSelectedStatus(status);
                                                cardModal.onOpen();
                                            }}
                                        >
                                            + Thêm task
                                        </Button>
                                        <SortableContext
                                            items={(cardsByStatus[status] || []).map((c) => c.id)}
                                            strategy={verticalListSortingStrategy}
                                        >
                                            <Stack spacing="2">
                                                {(cardsByStatus[status] || []).map((c) => (
                                                    <CardItem
                                                        key={c.id}
                                                        card={c}
                                                        onEdit={(c) => { setEditingCard(c); cardModal.onOpen(); }}
                                                        onDelete={deleteCard}
                                                    />
                                                ))}
                                            </Stack>
                                        </SortableContext>
                                    </Box>
                                ))}

                                <DragOverlay dropAnimation={{ duration: 180, easing: "cubic-bezier(0.25, 1, 0.5, 1)" }}>
                                    {activeCard ? <CardItem card={activeCard} onEdit={() => {}} onDelete={() => {}} dragging /> : null}
                                </DragOverlay>
                            </DndContext>
                        </Flex>
                    </TabPanel>

                    <TabPanel>
                        <Box maxW="720px" mb="4">
                            <canvas ref={chartCanvasRef} />
                        </Box>
                    </TabPanel>

                    <TabPanel>
                        <Stack spacing="2">
                            {members.map((m) => (
                                <Box key={m.id} borderWidth="1px" borderRadius="md" p="2">
                                    {m.user.username} ({m.role})
                                </Box>
                            ))}
                        </Stack>
                    </TabPanel>

                    <TabPanel>
                        <Stack spacing="2" maxH="320px" overflowY="auto">
                            {histories.map(h => (
                                <Box key={h.id} borderWidth="1px" borderRadius="md" p="2">
                                    <Text fontSize="sm">
                                        #{h.card.id} {h.card.title}: {h.fromStatus} → {h.toStatus} lúc {h.changeDate}
                                    </Text>
                                </Box>
                            ))}
                        </Stack>
                    </TabPanel>
                </TabPanels>
            </Tabs>

            {/* Card modal */}
            <Modal
                isOpen={cardModal.isOpen}
                onClose={() => {
                    cardModal.onClose();
                    setEditingCard(null);
                }}
            >
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>{editingCard?.id ? "Sửa task" : "Thêm task"}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Stack spacing="3">
                            <Input
                                placeholder="Tiêu đề"
                                value={editingCard?.title ?? ""}
                                onChange={(e) =>
                                    setEditingCard((prev) => ({
                                        ...(prev || ({} as any)),
                                        title: e.target.value,
                                    }))
                                }
                            />
                            <Input
                                placeholder="Mô tả"
                                value={editingCard?.description ?? ""}
                                onChange={(e) =>
                                    setEditingCard((prev) => ({
                                        ...(prev || ({} as any)),
                                        description: e.target.value,
                                    }))
                                }
                            />
                            <Select
                                placeholder="Chọn trạng thái"
                                value={editingCard?.status ?? "TODO"}
                                onChange={(e) =>
                                    setEditingCard((prev) => ({
                                        ...(prev || ({} as any)),
                                        status: e.target.value as Status,
                                    }))
                                }
                            >
                                {STATUSES.map((s) => (
                                    <option key={s} value={s}>
                                        {s}
                                    </option>
                                ))}
                            </Select>

                            <Input type="date" placeholder="Deadline" value={dueDateInput} onChange={(e) => setDueDateInput(e.target.value)} />

                            <Select placeholder="Ưu tiên" value={priorityInput} onChange={(e) => setPriorityInput(e.target.value)}>
                                <option value="LOW">LOW</option>
                                <option value="MEDIUM">MEDIUM</option>
                                <option value="HIGH">HIGH</option>
                            </Select>

                            {/* Thêm tiêu đề trước Estimate / Actual */}
                            <FormControl>
                                <FormLabel>Estimate hours</FormLabel>
                                <NumberInput min={0} value={editingCard?.estimateHours ?? ""} onChange={(_, v) => setEditingCard((p) => ({ ...(p || ({} as any)), estimateHours: Number.isNaN(v) ? undefined : v }))}>
                                    <NumberInputField placeholder="Giờ ước lượng (ADMIN đặt)" />
                                </NumberInput>
                            </FormControl>

                            <FormControl>
                                <FormLabel>Actual hours</FormLabel>
                                <NumberInput min={0} value={editingCard?.actualHours ?? ""} onChange={(_, v) => setEditingCard((p) => ({ ...(p || ({} as any)), actualHours: Number.isNaN(v) ? undefined : v }))}>
                                    <NumberInputField placeholder="Giờ thực tế (ADMIN đặt)" />
                                </NumberInput>
                            </FormControl>

                            {editingCard?.createdAt && (
                                <Text fontSize="sm" color="gray.500">
                                    Ngày tạo: {editingCard.createdAt.slice(0, 10)}
                                </Text>
                            )}
                        </Stack>
                    </ModalBody>
                    <ModalFooter>
                        <Button mr={3} variant="ghost" onClick={cardModal.onClose}>
                            Hủy
                        </Button>
                        <Button
                            colorScheme="blue"
                            onClick={() => {
                                if (!editingCard?.title) {
                                    toast({ status: "warning", title: "Nhập tiêu đề" });
                                    return;
                                }
                                const status = editingCard?.status ?? "TODO";
                                saveCard({ ...editingCard, status });
                            }}
                        >
                            Lưu
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
            {/* Board edit modal (Admin only) */}
            <Modal isOpen={boardEditModal.isOpen} onClose={boardEditModal.onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Sửa board</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Stack spacing="3">
                            <Input value={board?.name ?? ""} onChange={(e) => setBoard(prev => prev ? { ...prev, name: e.target.value } : prev)} />
                            <Select
                                value={board?.status ?? "IN_PROGRESS"}
                                onChange={(e) => setBoard(prev => prev ? { ...prev, status: e.target.value as any } : prev)}
                            >
                                <option value="IN_PROGRESS">IN PROGRESS</option>
                                <option value="DONE">DONE</option>
                            </Select>
                            <Input
                                type="date"
                                value={board?.endDate ?? ""}
                                onChange={(e) => setBoard(prev => prev ? { ...prev, endDate: e.target.value } : prev)}
                                placeholder="Ngày kết thúc"
                            />
                            <FormControl>
                                <FormLabel>WIP limit (IN_PROGRESS)</FormLabel>
                                <NumberInput
                                    min={0}
                                    value={board?.wipLimit ?? ""}
                                    onChange={(_, valueNumber) =>
                                        setBoard((prev) =>
                                            prev ? { ...prev, wipLimit: Number.isFinite(valueNumber) ? valueNumber : null } : prev
                                        )
                                    }
                                >
                                    <NumberInputField />
                                </NumberInput>
                            </FormControl>
                        </Stack>
                    </ModalBody>
                    <ModalFooter>
                        <Button mr={3} onClick={boardEditModal.onClose}>Hủy</Button>
                        <Button colorScheme="blue" onClick={updateBoard}>Lưu</Button>
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