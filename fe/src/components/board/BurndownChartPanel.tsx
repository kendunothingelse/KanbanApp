import React from "react";
import { Card, Typography, Skeleton, Box } from "@mui/material";
import {
    ResponsiveContainer,
    AreaChart,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip as RTooltip,
    Legend,
    Area,
} from "recharts";
import { BurndownPoint } from "../../types";
import { palette } from "../../theme/colors";

interface Props {
    data: BurndownPoint[];
    loading: boolean;
    error: string | null;
    useArea?: boolean;
    idealLabel?: string;
    actualLabel?: string;
}

// Tăng chiều cao lên 450px
const BurndownChartPanel: React.FC<Props> = ({ data, loading, error, useArea = true, idealLabel = "Ideal", actualLabel = "Actual" }) => (
    <Card sx={{ p: 3, height: 450, display: "flex", flexDirection: "column", border: `1px solid ${palette.border.light}`, boxShadow: "none" }}>
        <Typography variant="subtitle1" fontWeight={700} mb={2} color="text.primary">
            Biểu đồ Burndown công việc
        </Typography>

        <Box flexGrow={1} minHeight={0}>
            {loading ? (
                <Skeleton variant="rectangular" height="100%" sx={{ borderRadius: 2 }} />
            ) : error ? (
                <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                    <Typography color="error">{error}</Typography>
                </Box>
            ) : data.length ? (
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={palette.border.light} />
                        <XAxis
                            dataKey="date"
                            tick={{ fontSize: 12, fill: palette.text.secondary }}
                            tickFormatter={(v) => v?.slice(5)}
                            minTickGap={30}
                        />
                        <YAxis tick={{ fontSize: 12, fill: palette.text.secondary }} />
                        <RTooltip
                            contentStyle={{
                                borderRadius: 8,
                                border: `1px solid ${palette.border.light}`,
                                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                            }}
                            labelFormatter={(l) => `Ngày: ${l}`}
                        />
                        <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '13px' }}/>
                        <Area
                            type="monotone"
                            dataKey="remaining"
                            name={actualLabel}
                            stroke={palette.primary.main}
                            fill={`${palette.primary.main}33`}
                            strokeWidth={3}
                            dot={{ r: 4, strokeWidth: 2 }}
                            activeDot={{ r: 6 }}
                        />
                        <Area
                            type="linear"
                            dataKey="ideal"
                            name={idealLabel}
                            stroke={palette.text.secondary}
                            fill="transparent"
                            strokeDasharray="5 5"
                            strokeWidth={2}
                            dot={false}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            ) : (
                <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                    <Typography color="text.secondary">Chưa có dữ liệu.</Typography>
                </Box>
            )}
        </Box>
    </Card>
);

export default BurndownChartPanel;