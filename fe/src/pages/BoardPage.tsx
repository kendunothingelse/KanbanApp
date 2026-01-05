import React, {useEffect, useMemo, useState} from "react";
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
import {SortableContext, verticalListSortingStrategy} from "@dnd-kit/sortable";
import {
    ResponsiveContainer,
    LineChart,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip as RTooltip,
    Legend,
    Line,
    ReferenceLine,
    Area,
    Bar, BarChart
} from "recharts";
import {useNavigate, useParams} from "react-router-dom";
import api from "../api";
import {useAuth} from "../auth/AuthContext";
import InviteMemberModal from "../components/InviteMemberModal";
import CardItem from "../components/board/CardItem";
import DroppableColumn from "../components/board/DroppableColumn";
import {getAvatarColor, getAvatarColorDifferent} from "../utils/avatarColor";
import {formatToUtc7} from "../utils/date";
import {
    Board,
    BoardMember,
    BurndownPoint,
    BurndownResponse,
    Card as CardType,
    CardHistory,
    Status,
    WeeklyVelocity
} from "../types";

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


const BoardPage: React.FC = () => {
    const {boardId} = useParams<{ boardId: string }>();
    const navigate = useNavigate();
    const {user} = useAuth();

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
    const [velocityMonthIndex, setVelocityMonthIndex] = useState(0);//phân trang Velocity theo tháng

    // NEW: Burndown/Velocity từ backend
    const [burndownData, setBurndownData] = useState<BurndownPoint[]>([]);
    const [velocityData, setVelocityData] = useState<WeeklyVelocity[]>([]);
    const [averageVelocity, setAverageVelocity] = useState(0);
    const [burndownLoading, setBurndownLoading] = useState(false);
    const [burndownError, setBurndownError] = useState<string | null>(null);
    const [remainingPoints, setRemainingPoints] = useState(0);
    const [totalPoints, setTotalPoints] = useState(0);
    const [estimatedEndDate, setEstimatedEndDate] = useState<string | null>(null);
    const [projectDeadline, setProjectDeadline] = useState<string | null>(null);
    const [projectHealth, setProjectHealth] = useState<string | null>(null);

    const mainColor = getAvatarColor(user?.username);
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {distance: 5},
        })
    );

    // ================Load data ======================================
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

    const loadBurndownVelocity = async () => {
        setBurndownLoading(true);
        setBurndownError(null);
        try {
            const res = await api.get<BurndownResponse>(`/boards/${boardId}/burndown`);
            setBurndownData(res.data.burndownData || null);
            setVelocityData(res.data.velocityData || []);
            setAverageVelocity(res.data.averageVelocity || 0);
            setRemainingPoints(res.data.remainingPoints || 0);
            setTotalPoints(res.data.totalPoints || 0);
            setEstimatedEndDate(res.data.estimatedEndDate || null);
            setProjectDeadline(res.data.projectDeadline || null);
            setProjectHealth(res.data.projectHealth || null);
        } catch (error: any) {
            setBurndownError(error?.response?.data || error.message || "Không tải được burndown/velocity");
        } finally {
            setBurndownLoading(false);
        }
    };

    const refreshSnapshot = async () => {
        try {
            await api.post(`/boards/${boardId}/snapshot/refresh`);
        } catch {
            // bỏ qua để không chặn UI
        }
    };

    const loadAll = async () => {
        await Promise.all([loadBoard(), loadCards(), loadMembers(), loadHistories(), loadForecast(), loadBurndownVelocity()]);
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
// Reset về tháng đầu khi đổi dữ liệu velocity
    useEffect(() => {
        setVelocityMonthIndex(0);
    }, [velocityData]);
// Nhóm velocity theo tháng (dựa trên weekStart)
    const velocityMonths = useMemo(() => {
        const map = new Map<
            string,
            {
                label: string;
                weeks: WeeklyVelocity[];
                sortKey: number;
            }
        >();

        velocityData.forEach((w) => {
            const d = new Date(w.weekStart);
            const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
            const label = d.toLocaleDateString("vi-VN", {month: "long", year: "numeric"});
            const sortKey = d.getFullYear() * 100 + (d.getMonth() + 1);
            if (!map.has(key)) {
                map.set(key, {label, weeks: [], sortKey});
            }
            map.get(key)!.weeks.push(w);
        });

        // Sắp xếp tháng mới nhất lên trước
        return Array.from(map.values()).sort((a, b) => b.sortKey - a.sortKey);
    }, [velocityData]);

    const currentVelocityWeeks =
        velocityMonths.length && velocityMonthIndex >= 0 && velocityMonthIndex < velocityMonths.length
            ? velocityMonths[velocityMonthIndex].weeks : [];

    const currentVelocityMonthLabel =
        velocityMonths.length && velocityMonthIndex >= 0 && velocityMonthIndex < velocityMonths.length
            ? velocityMonths[velocityMonthIndex].label : "";
    const cardsByStatus = useMemo(() => {
        const map: Record<Status, CardType[]> = {TODO: [], IN_PROGRESS: [], DONE: []};
        cards.forEach((card) => map[card.status].push(card));
        Object.values(map).forEach((arr) => arr.sort((a, b) => (a.position ?? 0) - (b.position ?? 0)));
        return map;
    }, [cards]);

    // =============== Metrics (cycle time, throughput) ==================
    const metrics = useMemo(() => {
        const firstDoneByCard = new Map<number, Date>();
        histories.forEach((history) => {
            if (history.toStatus === "DONE") {
                const doneDate = new Date(history.changeDate);
                const existing = firstDoneByCard.get(history.card.id);
                if (existing === undefined || doneDate < existing) firstDoneByCard.set(history.card.id, doneDate);
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
        firstDoneByCard.forEach((date) => allDates.push(date as Date));
        const minDate = allDates.length ? allDates.reduce((a, b) => (a < b ? a : b)) : null;
        const maxDate = allDates.length ? allDates.reduce((a, b) => (a > b ? a : b)) : null;
        const daysSpan =
            minDate && maxDate ? Math.max(1, (maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)) : 1;
        const throughput = doneCount / daysSpan;

        const progress = cards.length ? (doneCount / cards.length) * 100 : 0;

        return {cycleTimes, avgCycle, throughput, progress, doneCount, total: cards.length};
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
            await api.post("/boards/change-role", {boardId: board.id, userId, role});
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
            await api.post("/boards/remove-member", {boardId: board.id, userId});
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
            await Promise.all([loadAll(), refreshSnapshot()]);
        } catch (error: any) {
            alert(error?.response?.data || error.message || "Lỗi lưu thẻ");
        }
    };

    const deleteCard = async (id: number) => {
        try {
            await api.delete(`/cards/${id}`);
            await Promise.all([loadAll(), refreshSnapshot()]);
        } catch (e: any) {
            alert(e?.response?.data || e.message || "Xóa thất bại");
        }
    };

    // ================== Drag & Drop ==================
    const handleDragStart = (event: DragStartEvent) => {
        const id = Number(event.active.id);
        const found = cards.find((card) => card.id === id) || null;
        setActiveCard(found);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const {active, over} = event;
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
            await Promise.all([loadAll(), refreshSnapshot()]);
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
        return <Chip size="small" label={status === "DONE" ? "DONE" : "IN PROGRESS"} color={color} sx={{ml: 1}}/>;
    };


    // ================== Render ==================
    return (
        <Box p={3} bgcolor="grey.50" minHeight="100vh">
            <Stack
                direction={{xs: "column", md: "row"}}
                spacing={2}
                alignItems="center"
                justifyContent="space-between"
                mb={2}
            >
                <Stack direction="row" spacing={1} alignItems="center">
                    <IconButton aria-label="Quay lại" size="small" onClick={() => navigate("/workspaces")}>
                        <ArrowBackIcon/>
                    </IconButton>
                    <Typography variant="h5">
                        {board?.name || `Board #${boardId}`}
                        {statusChip(board?.status)}
                    </Typography>
                </Stack>
                <Stack spacing={0.5} textAlign={{xs: "left", md: "right"}}>
                    {board?.createdAt &&
                        <Typography variant="body2">Created: {board.createdAt.slice(0, 10)}</Typography>}
                    {board?.endDate && <Typography variant="body2">End: {board.endDate}</Typography>}
                    {board?.wipLimit &&
                        <Typography variant="body2">WIP (IN PROGRESS) limit: {board.wipLimit}</Typography>}
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

            <Tabs value={tab} onChange={(_, v) => setTab(v)} textColor="primary" indicatorColor="primary" sx={{mb: 2}}>
                <Tab label="Kanban"/>
                <Tab label="Biểu đồ"/>
                <Tab label="Thành viên"/>
                <Tab label="Lịch sử"/>
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
                                    sx={{mb: 1}}
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
                                <CardItem card={activeCard} onEdit={() => {
                                }} onDelete={() => {
                                }} dragging/>
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
                        gridTemplateColumns: {xs: "1fr", md: "1fr 1fr"},
                        gap: 2,
                    }}
                >
                    <Box>
                        <Typography variant="h6" mb={1}>
                            Burndown chart (backend)
                        </Typography>
                        <Box maxWidth={720} height={360} mb={2} bgcolor="white" borderRadius={1} boxShadow={1} p={2}>
                            {burndownLoading ? (
                                <Typography color="text.secondary">Đang tải burndown...</Typography>
                            ) : burndownError ? (
                                <Typography color="error">{burndownError}</Typography>
                            ) : burndownData.length ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={burndownData} margin={{top: 10, right: 20, left: 0, bottom: 5}}>
                                        <CartesianGrid strokeDasharray="3 3"/>
                                        <XAxis dataKey="date" tick={{fontSize: 12}}/>
                                        <YAxis tick={{fontSize: 12}}/>
                                        <RTooltip/>
                                        <Legend/>
                                        <ReferenceLine y={0} stroke="#999"/>
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
                                            dot={{r: 3}}
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
                                Velocity (avg, backend): {averageVelocity.toFixed(2)} điểm/tuần
                            </Typography>
                            <Typography color="text.secondary">
                                Remaining points: {remainingPoints} / Total: {totalPoints}
                            </Typography>
                            <Typography color="text.secondary">
                                Ước tính hoàn thành: {estimatedEndDate ?? "Chưa đủ dữ liệu"}{" "}
                                {projectDeadline ? ` | Deadline: ${projectDeadline}` : ""}
                                {projectHealth ? ` | Trạng thái: ${projectHealth}` : ""}
                            </Typography>
                        </Stack>
                    </Box>

                    <Box>
                        <Typography variant="h6" mb={1}>
                            Velocity theo tuần
                        </Typography>
                        <Box maxWidth={720} height={360} mb={2} bgcolor="white" borderRadius={1} boxShadow={1} p={2}>
                            {burndownLoading ? (
                                <Typography color="text.secondary">Đang tải velocity...</Typography>
                            ) : burndownError ? (
                                <Typography color="error">{burndownError}</Typography>
                            ) : currentVelocityWeeks.length ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={currentVelocityWeeks}
                                              margin={{top: 10, right: 20, left: 0, bottom: 40}}>
                                        <CartesianGrid strokeDasharray="3 3"/>
                                        <XAxis dataKey="weekLabel" interval={0} tick={{fontSize: 11}} tickMargin={8}
                                               height={28} angle={0} textAnchor="middle"
                                        /> <YAxis/>
                                        <RTooltip/>
                                        <Legend/>
                                        <Bar dataKey="completedPoints" name="Points hoàn thành" fill="#1976d2"/>
                                        <Bar dataKey="completedTasks" name="Tasks hoàn thành" fill="#9c27b0"/>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <Typography color="text.secondary">Chưa có dữ liệu velocity.</Typography>
                            )}
                        </Box>

                        {/* Điều khiển phân trang theo tháng */}
                        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2} px={0.5}>
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={() => setVelocityMonthIndex((v) => Math.min(velocityMonths.length - 1, v + 1))}
                                disabled={velocityMonthIndex >= velocityMonths.length - 1}
                            >
                                « Tháng sau
                            </Button>
                            <Typography fontWeight={600}>
                                {currentVelocityMonthLabel || "Không có tháng"}
                                {velocityMonths.length > 0 ? ` (${velocityMonthIndex + 1}/${velocityMonths.length})` : ""}
                            </Typography>
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={() => setVelocityMonthIndex((v) => Math.max(0, v - 1))}
                                disabled={velocityMonthIndex <= 0}
                            >
                                Tháng trước »
                            </Button>
                        </Stack>

                        {/* Cycle Time & Forecast */}
                        <Typography variant="subtitle1" fontWeight={600} mb={1}>
                            4. Cycle Time (thời gian hoàn thành 1 task)
                        </Typography>
                        <Typography variant="body2" color="text.secondary" mb={1}>
                            CycleTime = Ngày DONE − Ngày bắt đầu (createdAt). Chỉ tính các task đã DONE và có lịch sử
                            DONE.
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

                        <Box mt={2} border={1} borderColor="grey.200" borderRadius={1} p={2} bgcolor="white"
                             boxShadow={1}>
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
                                <Box flexGrow={1}/>
                                {isAdmin && (
                                    <Stack direction="row" spacing={1}>
                                        <FormControl size="small" sx={{minWidth: 140}}>
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
                            InputLabelProps={{shrink: true}}
                            value={dueDateInput}
                            onChange={(e) => setDueDateInput(e.target.value)}
                            fullWidth
                        />

                        <FormControl fullWidth>
                            <InputLabel>Ưu tiên</InputLabel>
                            <Select value={priorityInput} label="Ưu tiên"
                                    onChange={(e) => setPriorityInput(e.target.value)}>
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
                            inputProps={{min: 0}}
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
                            inputProps={{min: 0}}
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
                            saveCard({...editingCard, status});
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
                            onChange={(e) => setBoard((prev) => (prev ? {...prev, name: e.target.value} : prev))}
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
                            InputLabelProps={{shrink: true}}
                            value={board?.endDate ?? ""}
                            onChange={(e) => setBoard((prev) => (prev ? {...prev, endDate: e.target.value} : prev))}
                            fullWidth
                        />
                        <TextField
                            label="WIP limit (IN_PROGRESS)"
                            type="number"
                            inputProps={{min: 0}}
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