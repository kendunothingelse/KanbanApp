import React from "react";
import { Card, Stack, Typography, IconButton, Skeleton, Box } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip as RTooltip, Bar, ReferenceLine, Label } from "recharts";
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
                                            loading, error, weeks, monthLabel, onPrev, onNext, disablePrev, disableNext, averageVelocity = 0
                                        }) => (
    <Card sx={{ p: 3, height: 450, display: "flex", flexDirection: "column", border: `1px solid ${palette.border.light}`, boxShadow: "none" }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="subtitle1" fontWeight={700} color="text.primary">Năng suất tuần (Velocity)</Typography>
            <Stack direction="row" spacing={1} alignItems="center" bgcolor={palette.background.muted} borderRadius={1} p={0.5}>
                <IconButton size="small" onClick={onPrev} disabled={disablePrev}><ArrowBackIcon fontSize="small" /></IconButton>
                <Typography variant="body2" fontWeight={600} minWidth={120} textAlign="center">{monthLabel || "—"}</Typography>
                <IconButton size="small" onClick={onNext} disabled={disableNext}><ArrowForwardIcon fontSize="small" /></IconButton>
            </Stack>
        </Stack>
        <Box flexGrow={1} minHeight={0}>
            {loading ? (
                <Skeleton variant="rectangular" height="100%" sx={{ borderRadius: 2 }} />
            ) : error ? (
                <Box display="flex" alignItems="center" justifyContent="center" height="100%"><Typography color="error">{error}</Typography></Box>
            ) : weeks.length ? (
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeks} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={palette.border.light} />
                        <XAxis dataKey="weekLabel" tick={{ fontSize: 12, fill: palette.text.secondary }} interval={0} />
                        <YAxis tick={{ fontSize: 12, fill: palette.text.secondary }} />
                        <RTooltip
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{ borderRadius: 8, border: `1px solid ${palette.border.light}`, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                        />
                        <Bar dataKey="completedPoints" name="Điểm hoàn thành" fill={palette.secondary.main} radius={[4, 4, 0, 0]} barSize={40} />
                        {/* Reference Line cho trung bình */}
                        {averageVelocity > 0 && (
                            <ReferenceLine y={averageVelocity} stroke={palette.accent.main} strokeDasharray="5 5" strokeWidth={2}>
                                <Label value={`Trung bình: ${averageVelocity.toFixed(1)}`} position="top" offset={10} fontSize={12} fill={palette.accent.main} fontWeight={600} />
                            </ReferenceLine>
                        )}
                    </BarChart>
                </ResponsiveContainer>
            ) : (
                <Box display="flex" alignItems="center" justifyContent="center" height="100%"><Typography variant="body2" color="text.secondary">Chưa có dữ liệu.</Typography></Box>
            )}
        </Box>
    </Card>
);

export default VelocityPanel;