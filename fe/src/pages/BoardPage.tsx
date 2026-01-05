import React, { useEffect, useMemo, useState } from "react";
import {
    Avatar,
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    Tab,
    Tabs,
    TextField,
    Tooltip,
    Typography,
    Alert
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
    closestCorners,
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip as RTooltip, Legend, Line, ReferenceLine, Area } from "recharts";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api";
import { useAuth } from "../auth/AuthContext";
import InviteMemberModal from "../components/InviteMemberModal";
import CardItem from "../components/board/CardItem";
import DroppableColumn from "../components/board/DroppableColumn";
import { getAvatarColor, getAvatarColorDifferent } from "../utils/avatarColor";
import { formatToUtc7 } from "../utils/date";
import { Board, BoardMember, Card as CardType, CardHistory, Status } from "../types";

const STATUSES: Status[] = ["TODO", "IN_PROGRESS", "DONE"];

type Forecast = {
    avgCycleDays: number;
    avgActualHours: number;
    totalCards: number;
    doneCards: number;
    remainingCards: number;
    remainingTimeDays: number;
    remainingEffortHours: number;
    estimatedEndDate: string | null;
};

// NEW: điểm burndown
type BurndownPoint = {
    date: string; // yyyy-MM-dd
    remaining: number;
    ideal: number;
};

const BoardPage: React.FC = () => {
    const { boardId } = useParams<{ boardId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [board, setBoard] = useState<Board | null>(null);
    const [cards, setCards] = useState<CardType[]>([]);
    const [members, setMembers] = useState<BoardMember[]>([]);
    const [editingCard, setEditingCard] = useState<CardType | null>(null);
    const [dueDateInput, setDueDateInput] = useState("");
    const [priorityInput, setPriorityInput] = useState("");
    const [estimateHours, setEstimateHours] = useState("");
    const [actualHours, setActualHours] = useState("");
    const [selectedStatus, setSelectedStatus] = useState<Status>("TODO");
    const [histories, setHistories] = useState<CardHistory[]>([]);
    const [activeCard, setActiveCard] = useState<CardType | null>(null);
    const [forecast, setForecast] = useState<Forecast | null>(null);
    const [roleUpdating, setRoleUpdating] = useState<number | null>(null);
    const [removingId, setRemovingId] = useState<number | null>(null);

    const [cardModalOpen, setCardModalOpen] = useState(false);
    const [inviteOpen, setInviteOpen] = useState(false);
    const [boardEditOpen, setBoardEditOpen] = useState(false);
    const [tab, setTab] = useState(0);

    const mainColor = getAvatarColor(user?.username);
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 5 },
        })
    );

    // ================== Load data ==================
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

    const loadForecast = async () => {
        try {
            const res = await api.get(`/boards/${boardId}/forecast`);
            setForecast(res.data);
        } catch {
            setForecast(null);
        }
    };

    const loadAll = async () => {
        await Promise.all([loadBoard(), loadCards(), loadMembers(), loadHistories(), loadForecast()]);
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
        cards.forEach((card) => map[card.status].push(card));
        Object.values(map).forEach((arr) => arr.sort((a, b) => (a.position ?? 0) - (b.position ?? 0)));
        return map;
    }, [cards]);

    // ================== Burndown & Velocity ==================
    const dateKey = (d: Date) => d.toISOString().slice(0, 10);

    const burndown = useMemo((): BurndownPoint[] => {
        if (!cards.length) return [];

        // map card -> earliest DONE date
        const doneMap = new Map<number, Date>();
        histories.forEach((h) => {
            if (h.toStatus === "DONE") {
                const d = new Date(h.changeDate);
                const current = doneMap.get(h.card.id);
                if (!current || d < current) doneMap.set(h.card.id, d);
            }
        });

        const parsed = cards
            .filter((c) => c.createdAt)
            .map((c) => {
                const created = new Date(c.createdAt as string);
                const done = doneMap.get(c.id);
                // dùng estimateHours làm story point; nếu không có, mặc định 1
                const points = Number.isFinite(c.estimateHours) ? Number(c.estimateHours) : 1;
                return { created, done, points };
            });

        if (!parsed.length) return [];

        const start = parsed.reduce((min, c) => (c.created < min ? c.created : min), parsed[0].created);
        const endCandidates: Date[] = [...parsed.map((c) => c.done).filter(Boolean) as Date[], new Date()];
        const end = endCandidates.reduce((max, d) => (d > max ? d : max), start);

        const days: string[] = [];
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            days.push(dateKey(d));
        }

        const totalPoints = parsed.reduce((s, c) => s + c.points, 0);

        const remainingByDay = days.map((day) => {
            const dayDate = new Date(day + "T00:00:00");
            let remaining = 0;
            parsed.forEach((c) => {
                const started = c.created <= dayDate;
                const done = c.done ? c.done <= dayDate : false;
                if (started && !done) remaining += c.points;
            });
            return remaining;
        });

        // đường lý tưởng: giảm đều
        const idealByDay = days.map((_, idx) => {
            const step = totalPoints / Math.max(1, days.length - 1);
            return Math.max(0, totalPoints - step * idx);
        });

        return days.map((d, i) => ({
            date: d,
            remaining: remainingByDay[i],
            ideal: idealByDay[i],
        }));
    }, [cards, histories]);

    const velocityInfo = useMemo(() => {
        if (!burndown.length) return { velocity: 0, remaining: 0, etaDate: null as string | null };

        const remainingToday = burndown[burndown.length - 1].remaining;
        const totalDone = burndown[0].remaining - remainingToday;
        const daysElapsed = Math.max(1, burndown.length - 1);
        const velocity = totalDone / daysElapsed; // điểm/ngày

        let etaDate: string | null = null;
        if (velocity > 0 && remainingToday > 0) {
            const daysNeeded = Math.ceil(remainingToday / velocity);
            const eta = new Date();
            eta.setDate(eta.getDate() + daysNeeded);
            etaDate = eta.toISOString().slice(0, 10);
        }

        return { velocity, remaining: remainingToday, etaDate };
    }, [burndown]);

    // ================== Metrics cũ (cycle time, throughput) ==================
    const metrics = useMemo(() => {
        const firstDoneByCard = new Map<number, Date>();
        histories.forEach((history) => {
            if (history.toStatus === "DONE") {
                const doneDate = new Date(history.changeDate);
                const existing = firstDoneByCard.get(history.card.id);
                if (!existing || doneDate < existing) firstDoneByCard.set(history.card.id, doneDate);
            }
        });

        const cycleTimes: number[] = [];
        let doneCount = 0;

        cards.forEach((card) => {
            const doneDate = firstDoneByCard.get(card.id);
            if (doneDate && card.createdAt) {
                const start = new Date(card.createdAt);
                const days = Math.max(0, (doneDate.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
                cycleTimes.push(days);
                doneCount += 1;
            }
        });

        const avgCycle = cycleTimes.length ? cycleTimes.reduce((a, b) => a + b, 0) / cycleTimes.length : 0;

        const allDates: Date[] = [];
        cards.forEach((card) => card.createdAt && allDates.push(new Date(card.createdAt)));
        firstDoneByCard.forEach((date) => allDates.push(date));
        const minDate = allDates.length ? allDates.reduce((a, b) => (a < b ? a : b)) : null;
        const maxDate = allDates.length ? allDates.reduce((a, b) => (a > b ? a : b)) : null;
        const daysSpan =
            minDate && maxDate ? Math.max(1, (maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)) : 1;
        const throughput = doneCount / daysSpan;

        const progress = cards.length ? (doneCount / cards.length) * 100 : 0;

        return { cycleTimes, avgCycle, throughput, progress, doneCount, total: cards.length };
    }, [cards, histories]);

    // ================== Role helpers ==================
    const myRole = useMemo(() => {
        const me = members.find((member) => member.user.username === user?.username);
        return me?.role ?? "VIEWER";
    }, [members, user]);

    const isAdmin = myRole === "ADMIN";
    const allowedInviteRoles = isAdmin ? ["ADMIN", "MEMBER", "VIEWER"] : ["MEMBER", "VIEWER"];

    const changeMemberRole = async (memberId: number, userId: number, role: string) => {
        if (!board) return;
        setRoleUpdating(memberId);
        try {
            await api.post("/boards/change-role", { boardId: board.id, userId, role });
            await loadMembers();
            alert("Đã cập nhật quyền");
        } catch (e: any) {
            alert(e?.response?.data || e.message || "Đổi quyền thất bại");
        } finally {
            setRoleUpdating(null);
        }
    };

    const removeMember = async (memberId: number, userId: number) => {
        if (!board) return;
        setRemovingId(memberId);
        try {
            await api.post("/boards/remove-member", { boardId: board.id, userId });
            await loadMembers();
            alert("Đã xóa thành viên");
        } catch (e: any) {
            alert(e?.response?.data || e.message || "Xóa thành viên thất bại");
        } finally {
            setRemovingId(null);
        }
    };

    // ================== CRUD card ==================
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
            setCardModalOpen(false);
            setEditingCard(null);
            loadAll();
        } catch (error: any) {
            alert(error?.response?.data || error.message || "Lỗi lưu thẻ");
        }
    };

    const deleteCard = async (id: number) => {
        await api.delete(`/cards/${id}`);
        loadAll();
    };

    // ================== Drag & Drop ==================
    const handleDragStart = (event: DragStartEvent) => {
        const id = Number(event.active.id);
        const found = cards.find((card) => card.id === id) || null;
        setActiveCard(found);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveCard(null);
        if (!over) return;

        const activeId = Number(active.id);
        const sourceCard = cards.find((card) => card.id === activeId);
        if (!sourceCard) return;

        let targetStatus = sourceCard.status;
        let targetIndex = 0;

        const overData = over.data?.current as any;
        if (overData?.type === "card") {
            targetStatus = overData.status as Status;
            const colCards = cardsByStatus[targetStatus] || [];
            const overIndex = colCards.findIndex((card) => card.id === Number(over.id));
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
        } catch (error: any) {
            alert(error?.response?.data || error.message || "Di chuyển thất bại");
        }
    };

    // ================== UI helpers ==================
    const renderMembers = () => {
        if (!members.length) return null;
        const firstTwo = members.slice(0, 2);
        const extra = members.length - firstTwo.length;

        return (
            <Box display="flex" alignItems="center" gap={0.5} mr={2}>
                {firstTwo.map((member) => (
                    <Tooltip key={member.id} title={`${member.user.username} (${member.role})`}>
                        <Avatar
                            sx={{
                                bgcolor: getAvatarColorDifferent(member.user.username, mainColor),
                                width: 32,
                                height: 32,
                                fontSize: 14,
                            }}
                        >
                            {member.user.username[0]?.toUpperCase()}
                        </Avatar>
                    </Tooltip>
                ))}
                {extra > 0 && (
                    <Tooltip title={members.slice(2).map((m) => `${m.user.username} (${m.role})`).join(", ")}>
                        <Typography fontSize={12} color="text.secondary">
                            và còn +{extra} người khác
                        </Typography>
                    </Tooltip>
                )}
            </Box>
        );
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
            setBoardEditOpen(false);
            loadBoard();
        } catch (error: any) {
            alert(error?.response?.data || error.message || "Cập nhật board thất bại");
        }
    };

    const statusChip = (status?: string) => {
        if (!status) return null;
        const color = status === "DONE" ? "success" : "warning";
        return <Chip size="small" label={status === "DONE" ? "DONE" : "IN PROGRESS"} color={color} sx={{ ml: 1 }} />;
    };

    // ================== Render ==================
    return (
        <Box p={3} bgcolor="grey.50" minHeight="100vh">
            <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={2}
                alignItems="center"
                justifyContent="space-between"
                mb={2}
            >
                <Stack direction="row" spacing={1} alignItems="center">
                    <IconButton aria-label="Quay lại" size="small" onClick={() => navigate("/workspaces")}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h5">
                        {board?.name || `Board #${boardId}`}
                        {statusChip(board?.status)}
                    </Typography>
                </Stack>
                <Stack spacing={0.5} textAlign={{ xs: "left", md: "right" }}>
                    {board?.createdAt && <Typography variant="body2">Created: {board.createdAt.slice(0, 10)}</Typography>}
                    {board?.endDate && <Typography variant="body2">End: {board.endDate}</Typography>}
                    {board?.wipLimit && <Typography variant="body2">WIP (IN PROGRESS) limit: {board.wipLimit}</Typography>}
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                    {renderMembers()}
                    {isAdmin && (
                        <Button variant="outlined" color="secondary" onClick={() => setBoardEditOpen(true)}>
                            Sửa board
                        </Button>
                    )}
                    <Button variant="contained" onClick={() => setInviteOpen(true)}>
                        Mời thành viên
                    </Button>
                </Stack>
            </Stack>

            <Tabs value={tab} onChange={(_, v) => setTab(v)} textColor="primary" indicatorColor="primary" sx={{ mb: 2 }}>
                <Tab label="Kanban" />
                <Tab label="Biểu đồ" />
                <Tab label="Thành viên" />
                <Tab label="Lịch sử" />
            </Tabs>

            {/* Kanban tab */}
            {tab === 0 && (
                <Box display="flex" gap={2} alignItems="flex-start" overflow="auto" pb={2}>
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCorners}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                    >
                        {STATUSES.map((status) => (
                            <DroppableColumn key={status} status={status}>
                                <Stack direction="row" justifyContent="space-between" mb={1}>
                                    <Typography variant="subtitle1" fontWeight={600}>
                                        {status}
                                    </Typography>
                                </Stack>
                                <Button
                                    size="small"
                                    variant="outlined"
                                    fullWidth
                                    sx={{ mb: 1 }}
                                    onClick={() => {
                                        setEditingCard({} as CardType);
                                        setSelectedStatus(status);
                                        setCardModalOpen(true);
                                    }}
                                >
                                    + Thêm task
                                </Button>
                                <SortableContext
                                    items={(cardsByStatus[status] || []).map((card) => card.id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    <Stack spacing={1.5}>
                                        {(cardsByStatus[status] || []).map((card) => (
                                            <CardItem
                                                key={card.id}
                                                card={card}
                                                onEdit={(c) => {
                                                    setEditingCard(c);
                                                    setCardModalOpen(true);
                                                }}
                                                onDelete={deleteCard}
                                            />
                                        ))}
                                    </Stack>
                                </SortableContext>
                            </DroppableColumn>
                        ))}

                        <DragOverlay
                            dropAnimation={{
                                duration: 180,
                                easing: "cubic-bezier(0.25, 1, 0.5, 1)",
                            }}
                        >
                            {activeCard ? (
                                <CardItem card={activeCard} onEdit={() => {}} onDelete={() => {}} dragging />
                            ) : null}
                        </DragOverlay>
                    </DndContext>
                </Box>
            )}

            {/* Biểu đồ tab: Burndown + Velocity */}
            {tab === 1 && (
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                        gap: 2,
                    }}
                >
                    <Box>
                        <Typography variant="h6" mb={1}>
                            Burndown chart (Recharts)
                        </Typography>
                        <Box maxWidth={720} height={360} mb={2} bgcolor="white" borderRadius={1} boxShadow={1} p={2}>
                            {burndown.length ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={burndown} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                                        <YAxis tick={{ fontSize: 12 }} />
                                        <RTooltip />
                                        <Legend />
                                        <ReferenceLine y={0} stroke="#999" />
                                        <Area
                                            type="monotone"
                                            dataKey="remaining"
                                            fill="rgba(25,118,210,0.08)"
                                            stroke="rgba(25,118,210,0.4)"
                                            activeDot={false}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="remaining"
                                            name="Remaining (thực tế)"
                                            stroke="#1976d2"
                                            strokeWidth={2.2}
                                            dot={{ r: 3 }}
                                        />
                                        <Line
                                            type="linear"
                                            dataKey="ideal"
                                            name="Ideal"
                                            stroke="#555"
                                            strokeDasharray="6 6"
                                            dot={false}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <Typography color="text.secondary">Chưa có dữ liệu burndown.</Typography>
                            )}
                        </Box>
                        <Stack spacing={1}>
                            <Typography fontWeight={600}>
                                Velocity (avg): {velocityInfo.velocity.toFixed(2)} điểm/ngày
                            </Typography>
                            <Typography color="text.secondary">
                                Remaining điểm: {velocityInfo.remaining}{" "}
                                {velocityInfo.etaDate
                                    ? ` | Ước tính hoàn thành: ${velocityInfo.etaDate}`
                                    : "(chưa đủ dữ liệu)"}
                            </Typography>
                            <Typography color="text.secondary">
                                Tổng điểm ban đầu: {burndown.length ? burndown[0].remaining : 0}
                            </Typography>
                        </Stack>
                    </Box>

                    <Box>
                        <Typography variant="subtitle1" fontWeight={600} mb={1}>
                            4. Cycle Time (thời gian hoàn thành 1 task)
                        </Typography>
                        <Typography variant="body2" color="text.secondary" mb={1}>
                            CycleTime = Ngày DONE − Ngày bắt đầu (createdAt). Chỉ tính các task đã DONE và có lịch sử DONE.
                        </Typography>
                        <Box
                            border={1}
                            borderColor="grey.200"
                            borderRadius={1}
                            p={2}
                            maxHeight={360}
                            overflow="auto"
                            bgcolor="grey.50"
                        >
                            <Stack spacing={1}>
                                {metrics.cycleTimes.length > 0 ? (
                                    cards
                                        .filter((card) =>
                                            histories.some((h) => h.card.id === card.id && h.toStatus === "DONE")
                                        )
                                        .map((card) => {
                                            const history = histories
                                                .filter((h) => h.card.id === card.id && h.toStatus === "DONE")
                                                .sort(
                                                    (a, b) =>
                                                        new Date(a.changeDate).getTime() -
                                                        new Date(b.changeDate).getTime()
                                                )[0];
                                            const start = card.createdAt ? new Date(card.createdAt) : null;
                                            const done = history ? new Date(history.changeDate) : null;
                                            const days =
                                                start && done
                                                    ? Math.max(
                                                        0,
                                                        (done.getTime() - start.getTime()) /
                                                        (1000 * 60 * 60 * 24)
                                                    )
                                                    : null;
                                            return (
                                                <Typography key={card.id} variant="body2">
                                                    {card.title}: {days !== null ? `${days.toFixed(2)} ngày` : "N/A"}
                                                </Typography>
                                            );
                                        })
                                ) : (
                                    <Typography variant="body2" color="text.secondary">
                                        Chưa có dữ liệu cycle time.
                                    </Typography>
                                )}
                            </Stack>
                        </Box>

                        <Box mt={2} border={1} borderColor="grey.200" borderRadius={1} p={2} bgcolor="white" boxShadow={1}>
                            <Typography variant="subtitle1" fontWeight={600} mb={1}>
                                5. Dự báo tiến độ (backend)
                            </Typography>
                            {forecast ? (
                                <Stack spacing={0.5} fontSize={14} color="text.primary">
                                    <Typography fontWeight={600}>
                                        5.1 Remaining Time (Cycle Time): {forecast.remainingTimeDays.toFixed(2)} ngày
                                    </Typography>
                                    <Typography color="text.secondary">
                                        Avg Cycle Time: {forecast.avgCycleDays.toFixed(2)} ngày; Remaining Task:{" "}
                                        {forecast.remainingCards}/{forecast.totalCards}
                                    </Typography>

                                    <Typography fontWeight={600}>
                                        5.2 Remaining Effort (giờ): {forecast.remainingEffortHours.toFixed(2)} giờ
                                    </Typography>
                                    <Typography color="text.secondary">
                                        Avg Actual Hours: {forecast.avgActualHours.toFixed(2)} giờ
                                    </Typography>

                                    <Typography fontWeight={600}>
                                        5.3 Estimated End Date: {forecast.estimatedEndDate ?? "Chưa đủ dữ liệu"}
                                    </Typography>
                                </Stack>
                            ) : (
                                <Typography variant="body2" color="text.secondary">
                                    Chưa đủ dữ liệu để dự báo.
                                </Typography>
                            )}
                        </Box>
                    </Box>
                </Box>
            )}

            {/* Thành viên tab */}
            {tab === 2 && (
                <Stack spacing={1.5}>
                    {members.map((member) => (
                        <Box key={member.id} border={1} borderColor="grey.200" borderRadius={1} p={2}>
                            <Stack direction="row" alignItems="center" spacing={2}>
                                <Avatar
                                    sx={{
                                        bgcolor: getAvatarColorDifferent(member.user.username, mainColor),
                                        width: 36,
                                        height: 36,
                                    }}
                                >
                                    {member.user.username[0]?.toUpperCase()}
                                </Avatar>
                                <Stack spacing={0}>
                                    <Typography fontWeight={600}>{member.user.username}</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Role hiện tại: {member.role}
                                    </Typography>
                                </Stack>
                                <Box flexGrow={1} />
                                {isAdmin && (
                                    <Stack direction="row" spacing={1}>
                                        <FormControl size="small" sx={{ minWidth: 140 }}>
                                            <Select
                                                value={member.role}
                                                onChange={(e) =>
                                                    changeMemberRole(member.id, member.user.id, e.target.value)
                                                }
                                                disabled={roleUpdating === member.id}
                                            >
                                                <MenuItem value="ADMIN">ADMIN</MenuItem>
                                                <MenuItem value="MEMBER">MEMBER</MenuItem>
                                                <MenuItem value="VIEWER">VIEWER</MenuItem>
                                            </Select>
                                        </FormControl>
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            color="error"
                                            onClick={() => removeMember(member.id, member.user.id)}
                                            disabled={removingId === member.id || member.user.username === user?.username}
                                        >
                                            Xóa
                                        </Button>
                                    </Stack>
                                )}
                            </Stack>
                        </Box>
                    ))}
                </Stack>
            )}

            {/* Lịch sử tab */}
            {tab === 3 && (
                <Stack spacing={1} maxHeight={320} overflow="auto">
                    {histories.map((history) => (
                        <Box key={history.id} border={1} borderColor="grey.200" borderRadius={1} p={1.5}>
                            <Typography variant="body2">
                                #{history.card.id} {history.card.title}: {history.fromStatus} → {history.toStatus} lúc{" "}
                                {formatToUtc7(history.changeDate)}
                                {history.actor ? ` bởi ${history.actor.username}` : ""}
                            </Typography>
                        </Box>
                    ))}
                </Stack>
            )}

            {/* Modal Task */}
            <Dialog
                open={cardModalOpen}
                onClose={() => {
                    setCardModalOpen(false);
                    setEditingCard(null);
                }}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>{editingCard?.id ? "Sửa task" : "Thêm task"}</DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={2} mt={1}>
                        <TextField
                            placeholder="Tiêu đề"
                            label="Tiêu đề"
                            value={editingCard?.title ?? ""}
                            onChange={(e) =>
                                setEditingCard((prev) => ({
                                    ...(prev || ({} as CardType)),
                                    title: e.target.value,
                                }))
                            }
                            fullWidth
                        />
                        <TextField
                            placeholder="Mô tả"
                            label="Mô tả"
                            value={editingCard?.description ?? ""}
                            onChange={(e) =>
                                setEditingCard((prev) => ({
                                    ...(prev || ({} as CardType)),
                                    description: e.target.value,
                                }))
                            }
                            fullWidth
                        />
                        <FormControl fullWidth>
                            <InputLabel>Trạng thái</InputLabel>
                            <Select
                                value={editingCard?.status ?? "TODO"}
                                label="Trạng thái"
                                onChange={(e) =>
                                    setEditingCard((prev) => ({
                                        ...(prev || ({} as CardType)),
                                        status: e.target.value as Status,
                                    }))
                                }
                            >
                                {STATUSES.map((status) => (
                                    <MenuItem key={status} value={status}>
                                        {status}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <TextField
                            type="date"
                            label="Deadline"
                            InputLabelProps={{ shrink: true }}
                            value={dueDateInput}
                            onChange={(e) => setDueDateInput(e.target.value)}
                            fullWidth
                        />

                        <FormControl fullWidth>
                            <InputLabel>Ưu tiên</InputLabel>
                            <Select value={priorityInput} label="Ưu tiên" onChange={(e) => setPriorityInput(e.target.value)}>
                                <MenuItem value="LOW">LOW</MenuItem>
                                <MenuItem value="MEDIUM">MEDIUM</MenuItem>
                                <MenuItem value="HIGH">HIGH</MenuItem>
                            </Select>
                        </FormControl>

                        <TextField
                            label="Estimate hours"
                            type="number"
                            value={editingCard?.estimateHours ?? ""}
                            onChange={(e) =>
                                setEditingCard((prev) => ({
                                    ...(prev || ({} as CardType)),
                                    estimateHours: e.target.value === "" ? undefined : Number(e.target.value),
                                }))
                            }
                            inputProps={{ min: 0 }}
                            fullWidth
                        />

                        <TextField
                            label="Actual hours"
                            type="number"
                            value={editingCard?.actualHours ?? ""}
                            onChange={(e) =>
                                setEditingCard((prev) => ({
                                    ...(prev || ({} as CardType)),
                                    actualHours: e.target.value === "" ? undefined : Number(e.target.value),
                                }))
                            }
                            inputProps={{ min: 0 }}
                            fullWidth
                        />

                        {editingCard?.createdAt && (
                            <Typography variant="body2" color="text.secondary">
                                Ngày tạo: {editingCard.createdAt.slice(0, 10)}
                            </Typography>
                        )}
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCardModalOpen(false)}>Hủy</Button>
                    <Button
                        variant="contained"
                        onClick={() => {
                            if (!editingCard?.title) {
                                alert("Nhập tiêu đề");
                                return;
                            }
                            const status = editingCard?.status ?? "TODO";
                            saveCard({ ...editingCard, status });
                        }}
                    >
                        Lưu
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Modal chỉnh board */}
            <Dialog open={boardEditOpen} onClose={() => setBoardEditOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>Sửa board</DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={2} mt={1}>
                        <TextField
                            label="Tên board"
                            value={board?.name ?? ""}
                            onChange={(e) => setBoard((prev) => (prev ? { ...prev, name: e.target.value } : prev))}
                            fullWidth
                        />
                        <FormControl fullWidth>
                            <InputLabel>Trạng thái</InputLabel>
                            <Select
                                value={board?.status ?? "IN_PROGRESS"}
                                label="Trạng thái"
                                onChange={(e) =>
                                    setBoard((prev) =>
                                        prev
                                            ? {
                                                ...prev,
                                                status: e.target.value as any,
                                            }
                                            : prev
                                    )
                                }
                            >
                                <MenuItem value="IN_PROGRESS">IN PROGRESS</MenuItem>
                                <MenuItem value="DONE">DONE</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField
                            type="date"
                            label="Ngày kết thúc"
                            InputLabelProps={{ shrink: true }}
                            value={board?.endDate ?? ""}
                            onChange={(e) => setBoard((prev) => (prev ? { ...prev, endDate: e.target.value } : prev))}
                            fullWidth
                        />
                        <TextField
                            label="WIP limit (IN_PROGRESS)"
                            type="number"
                            inputProps={{ min: 0 }}
                            value={board?.wipLimit ?? ""}
                            onChange={(e) =>
                                setBoard((prev) =>
                                    prev
                                        ? {
                                            ...prev,
                                            wipLimit: e.target.value === "" ? null : Number(e.target.value),
                                        }
                                        : prev
                                )
                            }
                            fullWidth
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setBoardEditOpen(false)}>Hủy</Button>
                    <Button variant="contained" onClick={updateBoard}>
                        Lưu
                    </Button>
                </DialogActions>
            </Dialog>

            <InviteMemberModal
                isOpen={inviteOpen}
                onClose={() => setInviteOpen(false)}
                boardId={Number(boardId)}
                onInvited={loadMembers}
                allowedRoles={allowedInviteRoles}
            />
        </Box>
    );
};

export default BoardPage;