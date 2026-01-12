import React from "react";
import { Card, Typography, Skeleton, Box } from "@mui/material";
import {
    ResponsiveContainer,
    LineChart,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip as RTooltip,
    Legend,
    Line,
} from "recharts";
import { BurndownPoint } from "../../types";
import { palette } from "../../theme/colors";

interface Props {
    data: BurndownPoint[];
    loading:  boolean;
    error: string | null;
}

const BurndownChartPanel: React.FC<Props> = ({ data, loading, error }) => (
    <Card sx={{ p: 2.5, height: 420, border: `1px solid ${palette.border.light}` }}>
        <Typography variant="h6" mb={2} color="text.primary">
            Tiến độ Burndown
        </Typography>
        {loading ? (
            <Skeleton variant="rectangular" height={320} sx={{ borderRadius: 2 }} />
        ) : error ? (
            <Box display="flex" alignItems="center" justifyContent="center" height={320}>
                <Typography color="error">{error}</Typography>
            </Box>
        ) : data.length ?  (
            <ResponsiveContainer width="100%" height="85%">
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={palette.border. light} />
                    <XAxis
                        dataKey="date"
                        tick={{ fontSize: 11, fill: palette. text.secondary }}
                        tickFormatter={(v) => v?. slice(5)}
                        axisLine={{ stroke:  palette.border.light }}
                    />
                    <YAxis
                        tick={{ fontSize: 11, fill: palette. text.secondary }}
                        axisLine={{ stroke:  palette.border.light }}
                    />
                    <RTooltip
                        contentStyle={{
                            borderRadius: 8,
                            border: `1px solid ${palette.border. light}`,
                            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        }}
                        labelFormatter={(l) => `Ngày:  ${l}`}
                    />
                    <Legend verticalAlign="top" height={36} />
                    <Line
                        type="monotone"
                        dataKey="remaining"
                        name="Thực tế"
                        stroke={palette.primary. main}
                        strokeWidth={3}
                        dot={{ r: 4, fill: palette.primary.main }}
                        activeDot={{ r: 6 }}
                    />
                    <Line
                        type="linear"
                        dataKey="ideal"
                        name="Kế hoạch"
                        stroke={palette.text.secondary}
                        strokeDasharray="6 6"
                        dot={false}
                    />
                </LineChart>
            </ResponsiveContainer>
        ) : (
            <Box display="flex" alignItems="center" justifyContent="center" height={320}>
                <Typography color="text.secondary">Chưa có dữ liệu burndown. </Typography>
            </Box>
        )}
    </Card>
);

export default BurndownChartPanel;