import React from "react";
import { Card, Stack, Typography, IconButton, Skeleton, Box } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import {
    ResponsiveContainer,
    BarChart,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip as RTooltip,
    Bar,
    ReferenceLine,
    Label,
} from "recharts";
import { WeeklyVelocity } from "../../types";
import { palette } from "../../theme/colors";

interface Props {
    loading: boolean;
    error: string | null;
    weeks: WeeklyVelocity[];
    monthLabel: string;
    onPrev: () => void;
    onNext: () => void;
    disablePrev: boolean;
    disableNext: boolean;
    averageVelocity?: number;
}

const VelocityPanel: React.FC<Props> = ({
                                            loading,
                                            error,
                                            weeks,
                                            monthLabel,
                                            onPrev,
                                            onNext,
                                            disablePrev,
                                            disableNext,
                                            averageVelocity = 0,
                                        }) => (
    <Card sx={{ p: 2.5, height: 320, display: "flex", flexDirection: "column", border: `1px solid ${palette.border.light}`, boxShadow: "none" }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="h6" color="text.primary">Năng suất theo tuần</Typography>
            <Stack direction="row" spacing={0.5} alignItems="center">
                <IconButton size="small" onClick={onPrev} disabled={disablePrev}><ArrowBackIcon fontSize="small" /></IconButton>
                <Typography variant="caption" fontWeight={700} minWidth={110} textAlign="center">{monthLabel || "—"}</Typography>
                <IconButton size="small" onClick={onNext} disabled={disableNext}><ArrowForwardIcon fontSize="small" /></IconButton>
            </Stack>
        </Stack>
        <Box flexGrow={1}>
            {loading ? (
                <Skeleton variant="rectangular" height="100%" sx={{ borderRadius: 2 }} />
            ) : error ? (
                <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                    <Typography color="error">{error}</Typography>
                </Box>
            ) : weeks.length ? (
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeks} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={palette.border.light} />
                        <XAxis dataKey="weekLabel" hide />
                        <YAxis tick={{ fontSize: 11, fill: palette.text.secondary }}>
                            <Label position="insideLeft" angle={-90} value="Điểm/tuần" offset={10} />
                        </YAxis>
                        <RTooltip contentStyle={{ borderRadius: 8, border: `1px solid ${palette.border.light}` }} />
                        <ReferenceLine
                            y={averageVelocity}
                            stroke={palette.accent.main}
                            strokeDasharray="4 4"
                            strokeWidth={2}
                            label={{ value: `TB: ${averageVelocity.toFixed(1)}`, position: "right", fill: palette.accent.main }}
                        />
                        <Bar dataKey="completedPoints" name="Điểm/tuần" fill={palette.secondary.main} radius={[6, 6, 0, 0]} barSize={32} />
                    </BarChart>
                </ResponsiveContainer>
            ) : (
                <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                    <Typography color="text.secondary">Chưa có dữ liệu.</Typography>
                </Box>
            )}
        </Box>
    </Card>
);

export default VelocityPanel;