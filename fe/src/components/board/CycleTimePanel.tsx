import React from "react";
import { Card, Typography, Box } from "@mui/material";
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip as RTooltip, Bar, ReferenceLine } from "recharts";
import { Card as CardType, CardHistory } from "../../types";
import { palette } from "../../theme/colors";
import { labels } from "../../utils/labels";

interface Props { cards: CardType[]; histories: CardHistory[]; avgCycle: number; }

const CycleTimePanel: React.FC<Props> = ({ cards, histories, avgCycle }) => {
    const data = cards
        .filter((c) => c.status === "DONE")
        .map((c) => {
            const h = histories.filter((x) => x.card.id === c.id && x.toStatus === "DONE").sort((a, b) => new Date(a.changeDate).getTime() - new Date(b.changeDate).getTime())[0];
            if (!h || !c.createdAt) return null;
            const days = (new Date(h.changeDate).getTime() - new Date(c.createdAt).getTime()) / 86400000;
            return { name: c.title.slice(0, 15), days: Number(days.toFixed(1)) };
        })
        .filter(Boolean) as { name: string; days: number }[];

    // Tăng height của Card lên 450 để khớp với VelocityPanel
    return (
        <Card sx={{ p: 3, height: 450, display: "flex", flexDirection: "column", border: `1px solid ${palette.border.light}`, boxShadow: "none" }}>
            <Typography variant="subtitle1" fontWeight={700} mb={0.5} color="text.primary">
                {labels.cycleTime}
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
                Thời gian hoàn thành từng công việc (Ngày).
            </Typography>

            <Box flexGrow={1} minHeight={0}>
                {data.length ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 50 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={palette.border.light} />
                            <XAxis
                                dataKey="name"
                                interval={0}
                                angle={-45}
                                textAnchor="end"
                                height={60}
                                tick={{ fontSize: 11, fill: palette.text.secondary }}
                            />
                            <YAxis
                                label={{ value: "Ngày", angle: -90, position: "insideLeft", fontSize: 12, fill: palette.text.secondary }}
                                tick={{ fontSize: 12, fill: palette.text.secondary }}
                            />
                            <RTooltip
                                cursor={{ fill: 'transparent' }}
                                contentStyle={{ borderRadius: 8, border: `1px solid ${palette.border.light}`, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                            />
                            <Bar dataKey="days" name="Số ngày" fill={palette.primary.main} radius={[4, 4, 0, 0]} barSize={30} />
                            <ReferenceLine y={avgCycle} stroke={palette.accent.main} strokeDasharray="5 5" strokeWidth={2} label={{ value: "TB", position: 'insideTopLeft', fill: palette.accent.main, fontSize: 12 }} />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                        <Typography color="text.secondary">Chưa có công việc hoàn thành.</Typography>
                    </Box>
                )}
            </Box>
        </Card>
    );
};

export default CycleTimePanel;