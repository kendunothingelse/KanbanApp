import React, { useState, useEffect, useMemo } from "react";
import { Box, Grid } from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SpeedIcon from "@mui/icons-material/Speed";
import EventIcon from "@mui/icons-material/Event";
import { Board, Card as CardType, CardHistory, BurndownPoint, WeeklyVelocity } from "../../types";
import { getProjectDeadlineStatus, getTaskProgressStatus } from "../../utils/statusHelpers";
import StatCard from "./StatCard";
import BurndownChartPanel from "./BurndownChartPanel";
import VelocityPanel from "./VelocityPanel";
import CycleTimePanel from "./CycleTimePanel";
import ForecastGlossary from "./ForecastGlossary";

interface Forecast {
    avgCycleDays: number;
    avgActualHours: number;
    totalCards: number;
    doneCards: number;
    remainingCards: number;
    remainingTimeDays: number;
    remainingEffortHours: number;
    estimatedEndDate:  string | null;
}

interface ForecastTabProps {
    board:  Board | null;
    cards: CardType[];
    histories: CardHistory[];
    metrics: { avgCycle: number; doneCount: number; total: number };
    burndownData: BurndownPoint[];
    velocityMonths: { label: string; weeks: WeeklyVelocity[]; sortKey: number }[];
    averageVelocity: number;
    burndownLoading: boolean;
    burndownError: string | null;
    forecast: Forecast | null;
}

const ForecastTab: React.FC<ForecastTabProps> = ({
                                                     board,
                                                     cards,
                                                     histories,
                                                     metrics,
                                                     burndownData,
                                                     velocityMonths,
                                                     averageVelocity,
                                                     burndownLoading,
                                                     burndownError,
                                                     forecast,
                                                 }) => {
    const [velocityMonthIndex, setVelocityMonthIndex] = useState(0);

    useEffect(() => {
        setVelocityMonthIndex(0);
    }, [velocityMonths]);

    const currentVelocityWeeks = useMemo(() => {
        if (velocityMonths. length && velocityMonthIndex >= 0 && velocityMonthIndex < velocityMonths.length) {
            return velocityMonths[velocityMonthIndex].weeks;
        }
        return [];
    }, [velocityMonths, velocityMonthIndex]);

    const currentVelocityMonthLabel = useMemo(() => {
        if (velocityMonths.length && velocityMonthIndex >= 0 && velocityMonthIndex < velocityMonths.length) {
            return velocityMonths[velocityMonthIndex].label;
        }
        return "";
    }, [velocityMonths, velocityMonthIndex]);

    // Tính trạng thái deadline dự án
    const projectDeadlineStatus = useMemo(
        () => getProjectDeadlineStatus(board?.endDate),
        [board?. endDate]
    );

    // Tính trạng thái task dựa trên tiến độ thực tế
    const taskStatus = useMemo(
        () => getTaskProgressStatus(
            metrics.total,
            metrics. doneCount,
            board?.createdAt,
            board?.endDate
        ),
        [metrics.total, metrics. doneCount, board?.createdAt, board?.endDate]
    );

    return (
        <Box>
            {/* Stat Cards */}
            <Grid container spacing={2} mb={3}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Trạng thái dự án"
                        loading={burndownLoading}
                        value={projectDeadlineStatus.label}
                        color={projectDeadlineStatus. color}
                        icon={projectDeadlineStatus. icon}
                        subtitle={projectDeadlineStatus.subtitle}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Tiến độ task"
                        loading={burndownLoading}
                        value={taskStatus.label}
                        color={taskStatus.color}
                        icon={taskStatus.icon}
                        subtitle={taskStatus.subtitle}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Dự kiến hoàn thành"
                        loading={burndownLoading}
                        value={forecast?.estimatedEndDate ??  "N/A"}
                        color="#1976d2"
                        icon={<EventIcon />}
                        subtitle={
                            forecast
                                ?  `Còn ~${forecast.remainingTimeDays. toFixed(1)} ngày làm việc`
                                : ""
                        }
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Velocity trung bình"
                        loading={burndownLoading}
                        value={`${averageVelocity.toFixed(1)} pts/tuần`}
                        color="#9c27b0"
                        icon={<SpeedIcon />}
                        subtitle="Story Points / tuần"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Avg Cycle Time"
                        loading={! forecast}
                        value={`${metrics.avgCycle. toFixed(1)} ngày`}
                        color="#0288d1"
                        icon={<AccessTimeIcon />}
                        subtitle="TB thời gian hoàn thành 1 task"
                    />
                </Grid>
            </Grid>

            {/* Charts */}
            <Grid container spacing={2} mb={3}>
                <Grid item xs={12} md={8}>
                    <BurndownChartPanel
                        data={burndownData}
                        loading={burndownLoading}
                        error={burndownError}
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <VelocityPanel
                        loading={burndownLoading}
                        error={burndownError}
                        weeks={currentVelocityWeeks}
                        monthLabel={currentVelocityMonthLabel}
                        onPrev={() =>
                            setVelocityMonthIndex((v) => Math.min(velocityMonths.length - 1, v + 1))
                        }
                        onNext={() => setVelocityMonthIndex((v) => Math.max(0, v - 1))}
                        disablePrev={velocityMonthIndex >= velocityMonths.length - 1}
                        disableNext={velocityMonthIndex <= 0}
                    />
                </Grid>
            </Grid>

            {/* Cycle Time & Glossary */}
            <CycleTimePanel cards={cards} histories={histories} avgCycle={metrics.avgCycle} />
            <ForecastGlossary />
        </Box>
    );
};

export default ForecastTab;