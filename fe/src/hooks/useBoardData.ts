import { useState, useEffect, useCallback, useMemo } from "react";
import api from "../api";
import {
    Board, BoardMember, Card as CardType, CardHistory,
    BurndownPoint, BurndownResponse, WeeklyVelocity, Status
} from "../types";

interface Forecast {
    avgCycleDays: number;
    avgActualHours: number;
    totalCards: number;
    doneCards: number;
    remainingCards: number;
    remainingTimeDays: number;
    remainingEffortHours: number;
    estimatedEndDate: string | null;
}

interface BoardMetrics {
    avgCycle: number;
    doneCount: number;
    total: number;
}

export function useBoardData(boardId: string | undefined) {
    const [board, setBoard] = useState<Board | null>(null);
    const [cards, setCards] = useState<CardType[]>([]);
    const [members, setMembers] = useState<BoardMember[]>([]);
    const [histories, setHistories] = useState<CardHistory[]>([]);
    const [forecast, setForecast] = useState<Forecast | null>(null);

    // Burndown data
    const [burndownData, setBurndownData] = useState<BurndownPoint[]>([]);
    const [velocityData, setVelocityData] = useState<WeeklyVelocity[]>([]);
    const [averageVelocity, setAverageVelocity] = useState(0);
    const [burndownLoading, setBurndownLoading] = useState(false);
    const [burndownError, setBurndownError] = useState<string | null>(null);
    const [estimatedEndDate, setEstimatedEndDate] = useState<string | null>(null);
    const [projectDeadline, setProjectDeadline] = useState<string | null>(null);
    const [projectHealth, setProjectHealth] = useState<string | null>(null);
    const [remainingPoints, setRemainingPoints] = useState<number>(0);

    const loadBoard = useCallback(async () => {
        if (!boardId) return;
        try {
            const res = await api.get(`/boards/${boardId}`);
            setBoard(res.data);
        } catch (e) {
            console.error("Error loading board:", e);
        }
    }, [boardId]);

    const loadCards = useCallback(async () => {
        if (!boardId) return;
        try {
            const res = await api.get(`/boards/${boardId}/cards`);
            setCards(res.data);
        } catch (e) {
            console.error("Error loading cards:", e);
        }
    }, [boardId]);

    const loadMembers = useCallback(async () => {
        if (!boardId) return;
        try {
            const res = await api.get(`/boards/${boardId}/members`);
            setMembers(res. data ??  []);
        } catch (e) {
            console.error("Error loading members:", e);
        }
    }, [boardId]);

    const loadHistories = useCallback(async () => {
        if (! boardId) return;
        try {
            const res = await api.get(`/boards/${boardId}/history`);
            setHistories(res. data ??  []);
        } catch (e) {
            console.error("Error loading histories:", e);
        }
    }, [boardId]);

    const loadForecast = useCallback(async () => {
        if (!boardId) return;
        try {
            const res = await api.get(`/boards/${boardId}/forecast`);
            setForecast(res.data ??  null);
        } catch (e) {
            console.error("Error loading forecast:", e);
        }
    }, [boardId]);

    const loadBurndownVelocity = useCallback(async () => {
        if (! boardId) return;
        setBurndownLoading(true);
        setBurndownError(null);
        try {
            const res = await api.get<BurndownResponse>(`/boards/${boardId}/burndown`);
            setBurndownData(res.data. burndownData || []);
            setVelocityData(res.data. velocityData || []);
            setAverageVelocity(res.data.averageVelocity || 0);
            setEstimatedEndDate(res.data. estimatedEndDate || null);
            setProjectDeadline(res.data.projectDeadline || null);
            setProjectHealth(res.data.projectHealth || null);
            setRemainingPoints(res.data.remainingPoints ??  0);
        } catch (e:  any) {
            setBurndownError(e?. response?.data || e.message || "Không tải được burndown/velocity");
        } finally {
            setBurndownLoading(false);
        }
    }, [boardId]);

    const refreshSnapshot = useCallback(() => {
        if (! boardId) return;
        api.post(`/boards/${boardId}/snapshot/refresh`).catch(() => {});
    }, [boardId]);

    const loadAll = useCallback(async () => {
        await Promise.all([
            loadBoard(),
            loadCards(),
            loadMembers(),
            loadHistories(),
            loadForecast(),
            loadBurndownVelocity(),
        ]);
    }, [loadBoard, loadCards, loadMembers, loadHistories, loadForecast, loadBurndownVelocity]);

    useEffect(() => {
        loadAll();
    }, [loadAll]);

    // Cards grouped by status
    const cardsByStatus = useMemo(() => {
        const map:  Record<Status, CardType[]> = { TODO: [], IN_PROGRESS: [], DONE: [] };
        cards.forEach((c) => map[c.status]. push(c));
        Object.values(map).forEach((arr) => arr.sort((a, b) => (a.position ??  0) - (b.position ?? 0)));
        return map;
    }, [cards]);

    // Metrics calculation
    const metrics:  BoardMetrics = useMemo(() => {
        const firstDone = new Map<number, Date>();
        histories.forEach((h) => {
            if (h.toStatus === "DONE") {
                const d = new Date(h.changeDate);
                const exist = firstDone. get(h.card.id);
                if (! exist || d < exist) firstDone.set(h.card.id, d);
            }
        });

        const cycleTimes:  number[] = [];
        let done = 0;
        cards.forEach((c) => {
            if (c.status === "DONE") {
                done++;
                const d = firstDone.get(c.id);
                if (d && c.createdAt) {
                    const start = new Date(c.createdAt);
                    const days = Math.max(0, (d.getTime() - start.getTime()) / 86400000);
                    cycleTimes.push(days);
                }
            }
        });

        const avgCycle = cycleTimes. length
            ? cycleTimes.reduce((a, b) => a + b, 0) / cycleTimes.length
            : 0;

        return { avgCycle, doneCount: done, total: cards.length };
    }, [cards, histories]);

    // Velocity months grouping
    const velocityMonths = useMemo(() => {
        const map = new Map<string, { label: string; weeks: WeeklyVelocity[]; sortKey: number }>();
        velocityData.forEach((w) => {
            const d = new Date(w.weekStart);
            const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
            const label = d.toLocaleDateString("vi-VN", { month: "long", year: "numeric" });
            const sortKey = d.getFullYear() * 100 + (d.getMonth() + 1);
            if (!map.has(key)) map.set(key, { label, weeks:  [], sortKey });
            map.get(key)!.weeks.push(w);
        });
        return Array.from(map. values()).sort((a, b) => b.sortKey - a.sortKey);
    }, [velocityData]);

    return {
        // Data
        board, setBoard,
        cards, setCards,
        members,
        histories,
        forecast,
        cardsByStatus,
        metrics,

        // Burndown
        burndownData,
        velocityData,
        velocityMonths,
        averageVelocity,
        burndownLoading,
        burndownError,
        estimatedEndDate,
        projectDeadline,
        projectHealth,
        remainingPoints,

        // Actions
        loadAll,
        loadBoard,
        loadCards,
        loadMembers,
        refreshSnapshot,
    };
}