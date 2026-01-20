import React, { useMemo, useState, useEffect } from "react";
import { Box, Grid, Card, Stack, Typography, Button, Collapse } from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SpeedIcon from "@mui/icons-material/Speed";
import EventIcon from "@mui/icons-material/Event";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningIcon from "@mui/icons-material/Warning";
import { Board, BurndownPoint, WeeklyVelocity } from "../../types";
import { getProjectDeadlineStatus, getTaskProgressStatus } from "../../utils/statusHelpers";
import StatCard from "./StatCard";
import BurndownChartPanel from "./BurndownChartPanel";
import VelocityPanel from "./VelocityPanel";
import CycleTimePanel from "./CycleTimePanel";
import { palette, healthColors } from "../../theme/colors";
import HelpTooltip from "../common/HelpTooltip";
import ForecastAnalysis from "./ForecastAnalysis";
import { copy } from "./ForecastCopy";

interface Props {
    board: Board | null;
    cards: any[];
    histories: any[];
    metrics: { avgCycle: number; doneCount: number; total: number };
    burndownData: BurndownPoint[];
    velocityMonths: { label: string; weeks: WeeklyVelocity[]; sortKey: number }[];
    averageVelocity: number;
    burndownLoading: boolean;
    burndownError: string | null;
    forecast: any;
    estimatedEndDate?: string | null;
    projectHealth?: string | null;
    remainingPoints?: number;
    daysAheadOrBehind?: number | null;
}

const ForecastTab: React.FC<Props> = ({
                                          board, cards, histories, metrics, burndownData, velocityMonths, averageVelocity,
                                          burndownLoading, burndownError, forecast, estimatedEndDate, projectHealth,
                                          remainingPoints, daysAheadOrBehind,
                                      }) => {
    const [velocityMonthIndex, setVelocityMonthIndex] = useState(0);
    const [showCharts, setShowCharts] = useState(false);

    useEffect(() => setVelocityMonthIndex(0), [velocityMonths]);

    const currentVelocityWeeks = useMemo(
        () => velocityMonths[velocityMonthIndex]?.weeks ?? [],
        [velocityMonths, velocityMonthIndex]
    );
    const currentVelocityMonthLabel = useMemo(
        () => velocityMonths[velocityMonthIndex]?.label ?? "",
        [velocityMonths, velocityMonthIndex]
    );
    const projectDeadlineStatus = useMemo(
        () => getProjectDeadlineStatus(board?.endDate),
        [board?.endDate]
    );

    const finishDateStr = estimatedEndDate
        ? new Date(estimatedEndDate).toLocaleDateString("vi-VN", {
            weekday: "long", year: "numeric", month: "long", day: "numeric",
        })
        : "Chưa đủ dữ liệu";

    const healthLabel =
        projectHealth === "DELAYED"
            ? "Cần chú ý gấp!"
            : projectHealth === "AT_RISK"
                ? "Có rủi ro trễ hạn"
                : "Mọi thứ ổn định";
    const healthColor =
        projectHealth === "DELAYED"
            ? healthColors.DELAYED
            : projectHealth === "AT_RISK"
                ? healthColors.AT_RISK
                : healthColors.ON_TRACK;

    return (
        <Box id="forecast-tab-container">
            {/* Tổng quan + giải thích */}
            <Card sx={{ p: 3, mb: 3, borderLeft: `6px solid ${healthColor}` }}>
                <Stack direction={{ xs: "column", md: "row" }} spacing={3} alignItems="center">
                    {projectHealth === "DELAYED" ? (
                        <WarningIcon sx={{ color: healthColor, fontSize: 48 }} />
                    ) : (
                        <CheckCircleIcon sx={{ color: healthColor, fontSize: 48 }} />
                    )}
                    <Box flexGrow={1}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <Typography variant="h5" fontWeight={700} color="text.primary">
                                {copy.overviewTitle}
                            </Typography>
                            <HelpTooltip title={copy.forecastHelp} />
                        </Stack>
                        <Typography variant="body1" color="text.secondary" mb={1}>
                            {copy.overviewDesc}
                        </Typography>
                        <Typography variant="h6" color={palette.primary.main} fontWeight={700}>
                            {healthLabel}: {finishDateStr}
                        </Typography>
                    </Box>
                </Stack>
            </Card>

            {/* Phân tích gợi ý hành động */}
            <ForecastAnalysis
                projectHealth={projectHealth}
                daysAheadOrBehind={daysAheadOrBehind}
                averageVelocity={averageVelocity}
                remainingPoints={remainingPoints || 0}
            />

            {/* KPI chính */}
            <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                <Typography variant="h6" fontWeight={700}>{copy.kpiHeader}</Typography>
                <HelpTooltip title={copy.kpiHelp} />
            </Stack>

            <Grid container spacing={2} mb={3}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Tốc độ trung bình/tuần (Velocity)"
                        value={averageVelocity.toFixed(1)}
                        subtitle="điểm hoặc giờ / tuần"
                        color={palette.secondary.main}
                        icon={<SpeedIcon />}
                        loading={burndownLoading}
                    />
                    <HelpTooltip title="Velocity: tốc độ trung bình nhóm hoàn thành công việc mỗi tuần." />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Số ngày để xong 1 việc (Cycle Time)"
                        value={metrics.avgCycle.toFixed(1)}
                        subtitle="ngày / việc"
                        color={palette.primary.main}
                        icon={<AccessTimeIcon />}
                    />
                    <HelpTooltip title="Cycle Time: số ngày trung bình từ lúc tạo đến khi hoàn thành một việc." />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Khối lượng còn lại"
                        value={remainingPoints || 0}
                        subtitle="điểm/giờ công việc chưa hoàn thành"
                        color={palette.warning.main}
                        icon={<WarningIcon />}
                    />
                    <HelpTooltip title="Tổng khối lượng công việc chưa xong (tính theo điểm hoặc giờ ước tính)." />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Hạn chót dự án (Deadline)"
                        value={projectDeadlineStatus.label}
                        subtitle={board?.endDate || "Chưa đặt"}
                        color={projectDeadlineStatus.color}
                        icon={<EventIcon />}
                    />
                    <HelpTooltip title="So sánh hôm nay với ngày deadline của dự án để biết còn kịp hay không." />
                </Grid>
            </Grid>
            {/* Biểu đồ chi tiết có thể ẩn/hiện */}
            <Box textAlign="center" mb={3}>
                <Button
                    variant={showCharts ? "outlined" : "contained"}
                    onClick={() => setShowCharts(!showCharts)}
                >
                    {showCharts ? "Ẩn biểu đồ phân tích" : "Xem biểu đồ phân tích"}
                </Button>
            </Box>

            <Collapse in={showCharts}>
                <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                    <Typography variant="h6" fontWeight={700}>{copy.chartsHeader}</Typography>
                    <HelpTooltip title="Nhìn xu hướng làm việc theo thời gian để dự báo chính xác hơn." />
                </Stack>

                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Box position="relative" height={450}>
                            <BurndownChartPanel
                                data={burndownData}
                                loading={burndownLoading}
                                error={burndownError}
                                idealLabel="Kế hoạch lý tưởng"
                                actualLabel="Thực tế còn lại"
                            />
                            <Box position="absolute" top={16} right={16}>
                                <HelpTooltip placement="left" title={copy.burndownHelp} />
                            </Box>
                        </Box>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Box position="relative" height="100%">
                            <VelocityPanel
                                loading={burndownLoading}
                                error={burndownError}
                                weeks={currentVelocityWeeks}
                                monthLabel={currentVelocityMonthLabel}
                                onPrev={() => setVelocityMonthIndex((v) => Math.min(velocityMonths.length - 1, v + 1))}
                                onNext={() => setVelocityMonthIndex((v) => Math.max(0, v - 1))}
                                disablePrev={velocityMonthIndex >= velocityMonths.length - 1}
                                disableNext={velocityMonthIndex <= 0}
                                averageVelocity={averageVelocity}
                            />
                            <Box position="absolute" top={16} right={16}>
                                <HelpTooltip title={copy.velocityHelp} />
                            </Box>
                        </Box>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Box position="relative" height={450}>
                            <CycleTimePanel cards={cards} histories={histories} avgCycle={metrics.avgCycle} />
                            <Box position="absolute" top={16} right={16}>
                                <HelpTooltip placement="left" title={copy.cycleHelp} />
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </Collapse>
        </Box>
    );
};

export default ForecastTab;