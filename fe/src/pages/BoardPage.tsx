import React, { useState, useMemo, useCallback } from "react";
import { Box, Tab, Tabs } from "@mui/material";
import { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { useParams } from "react-router-dom";
import api from "../api";
import { useAuth } from "../auth/AuthContext";
import { useNotification } from "../components/NotificationProvider";
import { useBoardData } from "../hooks/useBoardData";
import { Card as CardType, Status } from "../types";
import { getAvatarColor } from "../utils/avatarColor";
import { palette } from "../theme/colors";

// Components
import BoardHeader from "../components/board/BoardHeader";
import KanbanBoard from "../components/board/KanbanBoard";
import ForecastTab from "../components/board/ForecastTab";
import MemberList from "../components/board/MemberList";
import HistoryList from "../components/board/HistoryList";
import InviteMemberModal from "../components/InviteMemberModal";
import TaskModal, { TaskFormData } from "../components/board/TaskModal";
import BoardEditModal from "../components/board/BoardEditModal";

const BoardPage: React.FC = () => {
    const { boardId } = useParams<{ boardId: string }>();
    const { user } = useAuth();
    const { notify } = useNotification();

    // Custom hook for data fetching
    const {
        board, setBoard,
        cards,
        members,
        histories,
        forecast,
        cardsByStatus,
        metrics,
        burndownData,
        velocityMonths,
        averageVelocity,
        burndownLoading,
        burndownError,
        loadAll,
        loadMembers,
        refreshSnapshot,
    } = useBoardData(boardId);

    // Local state
    const [activeCard, setActiveCard] = useState<CardType | null>(null);
    const [cardModalOpen, setCardModalOpen] = useState(false);
    const [inviteOpen, setInviteOpen] = useState(false);
    const [boardEditOpen, setBoardEditOpen] = useState(false);
    const [editingCard, setEditingCard] = useState<CardType | null>(null);
    const [boardSaving, setBoardSaving] = useState(false);
    const [tab, setTab] = useState(0);

    const mainColor = getAvatarColor(user?.username);

    // Computed values
    const myRole = useMemo(
        () => members.find((m) => m.user. username === user?.username)?.role ??  "VIEWER",
        [members, user]
    );
    const isAdmin = myRole === "ADMIN";
    const allowedInviteRoles = isAdmin ? ["ADMIN", "MEMBER", "VIEWER"] :  ["MEMBER", "VIEWER"];

    // Handlers
    const handleDragStart = useCallback((e: DragStartEvent) => {
        const id = Number(e.active. id);
        const found = cards.find((c) => c.id === id) || null;
        setActiveCard(found);
    }, [cards]);

    const handleDragEnd = useCallback(async (e: DragEndEvent) => {
        const { active, over } = e;
        setActiveCard(null);
        if (! over) return;

        const activeId = Number(active.id);
        const source = cards.find((c) => c.id === activeId);
        if (! source) return;

        let targetStatus = source.status;
        let targetIndex = 0;
        const overData = over.data?. current as any;

        if (overData?.type === "card") {
            targetStatus = overData. status as Status;
            const col = cardsByStatus[targetStatus] || [];
            const idx = col.findIndex((c) => c.id === Number(over.id));
            targetIndex = idx >= 0 ? idx : col.length;
        } else if (overData?.type === "column") {
            targetStatus = overData. status as Status;
            targetIndex = (cardsByStatus[targetStatus] || []).length;
        }

        try {
            await api.post("/cards/move", {
                cardId: activeId,
                targetStatus,
                targetPosition: targetIndex,
            });
            await Promise.all([loadAll(), refreshSnapshot()]);
        } catch (err:  any) {
            notify(err?. response?.data || err. message || "Di chuyển thất bại", "error");
        }
    }, [cards, cardsByStatus, loadAll, refreshSnapshot, notify]);

    const handleAddCard = useCallback((status: Status) => {
        setEditingCard({ status } as CardType);
        setCardModalOpen(true);
    }, []);

    const handleEditCard = useCallback((card: CardType) => {
        setEditingCard(card);
        setCardModalOpen(true);
    }, []);

    const handleDeleteCard = useCallback(async (id: number) => {
        try {
            await api.delete(`/cards/${id}`);
            await Promise.all([loadAll(), refreshSnapshot()]);
        } catch (e: any) {
            notify(e?. response?.data || e.message || "Xóa thất bại", "error");
        }
    }, [loadAll, refreshSnapshot, notify]);

    const handleSaveCard = useCallback(async (
        card:  Partial<CardType>,
        formData: TaskFormData
    ) => {
        try {
            const payload = {
                ... card,
                dueDate: formData.dueDateInput || null,
                priority: formData.priorityInput || null,
                status: formData.selectedStatus,
                estimateHours: formData. estimateHours ?  Number(formData.estimateHours) : null,
                actualHours: formData.actualHours ?  Number(formData. actualHours) : null,
            };

            if (card.id) {
                await api.put("/cards", { id: card.id, ...payload });
            } else {
                await api.post("/cards", {
                    boardId: Number(boardId),
                    position: cardsByStatus[formData.selectedStatus]?.length || 0,
                    ... payload,
                });
            }

            setCardModalOpen(false);
            setEditingCard(null);
            await Promise.all([loadAll(), refreshSnapshot()]);
        } catch (e: any) {
            notify(e?.response?.data || e.message || "Lỗi lưu thẻ", "error");
        }
    }, [boardId, cardsByStatus, loadAll, refreshSnapshot, notify]);

    const handleSaveBoard = useCallback(async () => {
        if (!board) return;
        setBoardSaving(true);
        try {
            await api.put(`/boards/${board.id}`, {
                name: board.name,
                status: board.status,
                endDate: board.endDate || null,
                wipLimit: board.wipLimit ??  null,
            });
            notify("Đã lưu board", "success");
            await loadAll();
            setBoardEditOpen(false);
        } catch (e:  any) {
            notify(e?.response?.data || e. message || "Lưu board thất bại", "error");
        } finally {
            setBoardSaving(false);
        }
    }, [board, loadAll, notify]);

    const handleChangeMemberRole = useCallback(async (
        memberId: number,
        userId: number,
        role: string
    ) => {
        if (! board) return;
        try {
            await api.post("/boards/change-role", { boardId: board. id, userId, role });
            await loadMembers();
            notify("Đã cập nhật quyền");
        } catch (e: any) {
            notify(e?.response?.data || e.message || "Đổi quyền thất bại", "error");
        }
    }, [board, loadMembers, notify]);

    const handleRemoveMember = useCallback(async (memberId: number, userId: number) => {
        if (!board) return;
        try {
            await api.post("/boards/remove-member", { boardId: board.id, userId });
            await loadMembers();
            notify("Đã xóa thành viên");
        } catch (e: any) {
            notify(e?. response?.data || e.message || "Xóa thành viên thất bại", "error");
        }
    }, [board, loadMembers, notify]);

    return (
        <Box p={3} bgcolor={palette.background.default} minHeight="100vh">
            {/* Header */}
            <BoardHeader
                board={board}
                members={members}
                mainColor={mainColor}
                isAdmin={isAdmin}
                onEditBoard={() => setBoardEditOpen(true)}
                onInvite={() => setInviteOpen(true)}
            />

            {/* Tabs */}
            <Tabs
                value={tab}
                onChange={(_, v) => setTab(v)}
                textColor="primary"
                indicatorColor="primary"
                sx={{
                    mb: 2,
                    "& .MuiTab-root": { fontWeight: 600 },
                    "& . Mui-selected": { color: palette.primary.main },
                }}
            >
                <Tab label="Kanban" />
                <Tab label="Dự báo" />
                <Tab label="Thành viên" />
                <Tab label="Lịch sử" />
            </Tabs>

            {/* Tab Content */}
            {tab === 0 && (
                <KanbanBoard
                    cardsByStatus={cardsByStatus}
                    wipLimit={board?.wipLimit ??  null}
                    projectDeadline={board?.endDate ??  null}
                    activeCard={activeCard}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onAddCard={handleAddCard}
                    onEditCard={handleEditCard}
                    onDeleteCard={handleDeleteCard}
                />
            )}

            {tab === 1 && (
                <ForecastTab
                    board={board}
                    cards={cards}
                    histories={histories}
                    metrics={metrics}
                    burndownData={burndownData}
                    velocityMonths={velocityMonths}
                    averageVelocity={averageVelocity}
                    burndownLoading={burndownLoading}
                    burndownError={burndownError}
                    forecast={forecast}
                />
            )}

            {tab === 2 && (
                <MemberList
                    members={members}
                    mainColor={mainColor}
                    isAdmin={isAdmin}
                    onChangeRole={handleChangeMemberRole}
                    onRemove={handleRemoveMember}
                    currentUsername={user?.username}
                />
            )}

            {tab === 3 && <HistoryList histories={histories} />}

            {/* Modals */}
            <TaskModal
                open={cardModalOpen}
                onClose={() => {
                    setCardModalOpen(false);
                    setEditingCard(null);
                }}
                editingCard={editingCard}
                projectDeadline={board?.endDate ?? null}
                onSave={handleSaveCard}
            />

            <BoardEditModal
                open={boardEditOpen}
                onClose={() => setBoardEditOpen(false)}
                board={board}
                onBoardChange={setBoard}
                onSave={handleSaveBoard}
                saving={boardSaving}
            />

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