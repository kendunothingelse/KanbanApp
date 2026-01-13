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

const BurndownChartPanel: React.FC<Props> = ({ data, loading, error, useArea = true, idealLabel = "Ideal", actualLabel = "Actual" }) => (
    <Card sx={{ p: 2.5, height: 380, border: `1px solid ${palette.border.light}`, boxShadow: "none" }}>
        <Typography variant="h6" mb={2} color="text.primary">
            Biểu đồ Burdown công việc
        </Typography>
        {loading ? (
            <Skeleton variant="rectangular" height={280} sx={{ borderRadius: 2 }} />
        ) : error ? (
            <Box display="flex" alignItems="center" justifyContent="center" height={280}>
                <Typography color="error">{error}</Typography>
            </Box>
        ) : data.length ? (
            <ResponsiveContainer width="100%" height="85%">
                <AreaChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={palette.border.light} />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: palette.text.secondary }} tickFormatter={(v) => v?.slice(5)} />
                    <YAxis tick={{ fontSize: 11, fill: palette.text.secondary }} />
                    <RTooltip
                        contentStyle={{
                            borderRadius: 8,
                            border: `1px solid ${palette.border.light}`,
                            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                        }}
                        labelFormatter={(l) => `Ngày: ${l}`}
                    />
                    <Legend verticalAlign="top" height={30} />
                    <Area
                        type="monotone"
                        dataKey="remaining"
                        name={actualLabel}
                        stroke={palette.primary.main}
                        fill={`${palette.primary.main}33`}
                        strokeWidth={2.5}
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                    />
                    <Area
                        type="linear"
                        dataKey="ideal"
                        name={idealLabel}
                        stroke={palette.text.secondary}
                        fill="transparent"
                        strokeDasharray="6 6"
                        dot={false}
                    />
                </AreaChart>
            </ResponsiveContainer>
        ) : (
            <Box display="flex" alignItems="center" justifyContent="center" height={280}>
                <Typography color="text.secondary">Chưa có dữ liệu.</Typography>
            </Box>
        )}
    </Card>
);

export default BurndownChartPanel;