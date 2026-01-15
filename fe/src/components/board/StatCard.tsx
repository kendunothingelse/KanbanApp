import React from "react";
import { Card, Typography, Skeleton, Stack, Box } from "@mui/material";
import { palette } from "../../theme/colors";

interface StatCardProps {
    title: string;
    value: string | number;
    color?: string;
    icon?: React.ReactNode;
    subtitle?: string;
    loading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, color = palette.primary.main, icon, subtitle, loading = false }) => {
    if (loading) {
        return (
            <Card sx={{ p: 2, borderRadius: 2, border: `1px solid ${palette.border.light}`, boxShadow: "none" }}>
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="text" width="80%" height={30} />
            </Card>
        );
    }

    return (
        <Card sx={{ p: 2, borderRadius: 2, border: `1px solid ${palette.border.light}`, boxShadow: "none", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing={0.5}>
                {title}
            </Typography>
            <Stack direction="row" alignItems="center" spacing={1} mt={1}>
                {icon && <Box sx={{ color, display: "flex" }}>{icon}</Box>}
                <Typography variant="h5" fontWeight={700} sx={{ color }}>{value}</Typography>
            </Stack>
            {subtitle && <Typography variant="caption" color="text.secondary" mt={0.5}>{subtitle}</Typography>}
        </Card>
    );
};

export default StatCard;