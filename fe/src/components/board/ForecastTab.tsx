import React, { useMemo, useState, useEffect } from "react";
import { Box, Grid, Card, Stack, Typography, Chip } from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SpeedIcon from "@mui/icons-material/Speed";
import EventIcon from "@mui/icons-material/Event";
import WarningIcon from "@mui/icons-material/Warning";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { Board, Card as CardType, CardHistory, BurndownPoint, WeeklyVelocity } from "../../types";
import { getProjectDeadlineStatus, getTaskProgressStatus } from "../../utils/statusHelpers";
import StatCard from "./StatCard";
import BurndownChartPanel from "./BurndownChartPanel";
import VelocityPanel from "./VelocityPanel";
import CycleTimePanel from "./CycleTimePanel";
import ForecastGlossary from "./ForecastGlossary";
import { palette, healthColors } from "../../theme/colors";

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

type VelocityMonth = { label: string; weeks: WeeklyVelocity[]; sortKey: number };

interface Props {
    board: Board | null;
    cards: CardType[];
    histories: CardHistory[];
    metrics: { avgCycle: number; doneCount: number; total: number };
    burndownData: BurndownPoint[];
    velocityMonths: VelocityMonth[];
    averageVelocity: number;
    burndownLoading: boolean;
    burndownError: string | null;
    forecast: Forecast | null;
    estimatedEndDate?: string | null;
    projectHealth?: string | null;
    remainingPoints?: number;
}

const ForecastTab: React.FC<Props> = ({
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
                                          estimatedEndDate,
                                          projectHealth,
                                          remainingPoints,
                                      }) => {
    const [velocityMonthIndex, setVelocityMonthIndex] = useState(0);
    useEffect(() => setVelocityMonthIndex(0), [velocityMonths]);

    const currentVelocityWeeks = useMemo(() => velocityMonths[velocityMonthIndex]?.weeks ?? [], [velocityMonths, velocityMonthIndex]);
    const currentVelocityMonthLabel = useMemo(() => velocityMonths[velocityMonthIndex]?.label ?? "", [velocityMonths, velocityMonthIndex]);

    const projectDeadlineStatus = useMemo(() => getProjectDeadlineStatus(board?.endDate), [board?.endDate]);
    const taskStatus = useMemo(() => getTaskProgressStatus(metrics.total, metrics.doneCount, board?.createdAt, board?.endDate), [metrics.total, metrics.doneCount, board?.createdAt, board?.endDate]);

    const healthColor = projectHealth === "DELAYED" ? healthColors.DELAYED : projectHealth === "AT_RISK" ? healthColors.AT_RISK : healthColors.ON_TRACK;
    const healthLabel =
        projectHealth === "DELAYED" ? "Đang CHẬM so với kế hoạch" : projectHealth === "AT_RISK" ? "Có nguy cơ chậm tiến độ" : "Khả năng cao là KỊP";

    const finishDate = estimatedEndDate || forecast?.estimatedEndDate || null;
    const finishText = finishDate ? `Tại tốc độ hiện tại, bạn sẽ hoàn thành vào ngày ${finishDate}.` : "Chưa đủ dữ liệu để dự đoán ngày hoàn thành.";
    const isLate = finishDate && board?.endDate && finishDate > board.endDate;

    return (
        <Box>
            {/* Health Check */}
            <Card sx={{ p: 3, mb: 3, bgcolor: `${healthColor}0F`, border: `1px solid ${healthColor}`, boxShadow: "none" }}>
                <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="center" justifyContent="space-between">
                    <Stack direction="row" spacing={2} alignItems="center">
                        {projectHealth === "DELAYED" ? <WarningIcon sx={{ color: healthColor }} /> : <CheckCircleIcon sx={{ color: healthColor }} />}
                        <Box>
                            <Typography variant="h6" fontWeight={700} color={palette.text.primary}>Dự án có kịp Deadline không?</Typography>
                            <Typography color={palette.text.primary} fontWeight={600}>{healthLabel}</Typography>
                            <Typography variant="body2" color={palette.text.secondary}>{projectDeadlineStatus.subtitle}</Typography>
                        </Box>
                    </Stack>
                    <Chip label={finishDate ? `Ước tính hoàn thành: ${finishDate}` : "Chưa có ước tính"} sx={{ bgcolor: "#FFF", border: `1px solid ${palette.border.main}`, color: palette.text.primary }} />
                </Stack>
            </Card>

            {/* Progress */}
            <Card sx={{ p: 3, mb: 3, bgcolor: isLate ? `${palette.warning.light}33` : palette.background.paper, border: `1px solid ${isLate ? palette.warning.main : palette.border.light}`, boxShadow: "none" }}>
                <Typography variant="h6" fontWeight={700} color={palette.text.primary} gutterBottom>Tiến độ tổng thể</Typography>
                <Typography variant="body1" color={palette.text.primary} mb={1}>{finishText}</Typography>
                <Typography variant="body2" color={palette.text.secondary} mb={2}>
                    Công việc còn lại: {remainingPoints ?? 0} điểm | {metrics.doneCount}/{metrics.total} việc đã xong
                </Typography>
                <BurndownChartPanel data={burndownData} loading={burndownLoading} error={burndownError} useArea idealLabel="Kế hoạch" actualLabel="Khối lượng còn lại" />
            </Card>

            {/* Performance */}
            <Card sx={{ p: 3, mb: 3, boxShadow: "none", border: `1px solid ${palette.border.light}` }}>
                <Typography variant="h6" fontWeight={700} color={palette.text.primary} gutterBottom>Năng suất làm việc</Typography>
                <Grid container spacing={2} mb={2}>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard title="Tốc độ làm việc" loading={burndownLoading} value={`${averageVelocity.toFixed(1)} điểm/tuần`} color={palette.secondary.main} icon={<SpeedIcon />} subtitle="Trung bình mỗi tuần" />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard title="Thời gian hoàn thành 1 việc" loading={!forecast} value={`${metrics.avgCycle.toFixed(1)} ngày`} color={palette.primary.main} icon={<AccessTimeIcon />} subtitle="Từ lúc bắt đầu tới lúc xong" />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard title="Trạng thái công việc" loading={burndownLoading} value={taskStatus.label} color={taskStatus.color} icon={taskStatus.icon} subtitle={taskStatus.subtitle} />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard title="Hạn dự án" loading={burndownLoading} value={projectDeadlineStatus.label} color={projectDeadlineStatus.color} icon={<EventIcon />} subtitle={projectDeadlineStatus.subtitle} />
                    </Grid>
                </Grid>

                <Grid container spacing={2}>
                    <Grid item xs={12} md={8}>
                        <VelocityPanel
                            loading={burndownLoading}
                            error={burndownError}
                            weeks={currentVelocityWeeks}
                            monthLabel={currentVelocityMonthLabel}
                            averageVelocity={averageVelocity}
                            onPrev={() => setVelocityMonthIndex((v) => Math.min(velocityMonths.length - 1, v + 1))}
                            onNext={() => setVelocityMonthIndex((v) => Math.max(0, v - 1))}
                            disablePrev={velocityMonthIndex >= velocityMonths.length - 1}
                            disableNext={velocityMonthIndex <= 0}
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <CycleTimePanel cards={cards} histories={histories} avgCycle={metrics.avgCycle} />
                    </Grid>
                </Grid>
            </Card>

            <ForecastGlossary />
        </Box>
    );
};

export default ForecastTab;