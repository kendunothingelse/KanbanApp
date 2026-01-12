import React from "react";
import { Card, Typography, Skeleton, Stack, Box } from "@mui/material";
import { palette } from "../../theme/colors";

interface StatCardProps {
    title: string;
    value: string | number;
    color?:  string;
    icon?: React.ReactNode;
    subtitle?:  string;
    loading?: boolean;
}

const StatCard: React. FC<StatCardProps> = ({
                                                title,
                                                value,
                                                color = palette.primary.main,
                                                icon,
                                                subtitle,
                                                loading = false,
                                            }) => {
    if (loading) {
        return (
            <Card
                sx={{
                    p: 2.5,
                    borderRadius: 3,
                    border: `1px solid ${palette.border. light}`,
                    bgcolor: palette.background. paper,
                }}
            >
                <Skeleton variant="text" width="60%" height={20} />
                <Skeleton variant="text" width="80%" height={32} sx={{ mt: 1 }} />
                <Skeleton variant="text" width="50%" height={16} sx={{ mt:  0.5 }} />
            </Card>
        );
    }

    return (
        <Card
            sx={{
                p: 2.5,
                borderRadius: 3,
                border: `1px solid ${palette.border.light}`,
                bgcolor: palette.background.paper,
                transition: "box-shadow 0.2s ease, transform 0.2s ease",
                "&:hover": {
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    transform: "translateY(-2px)",
                },
            }}
        >
            <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={600}
                textTransform="uppercase"
                letterSpacing={0.5}
            >
                {title}
            </Typography>

            <Stack direction="row" alignItems="center" spacing={1} mt={1}>
                {icon && (
                    <Box sx={{ color, display: "flex", alignItems: "center" }}>
                        {icon}
                    </Box>
                )}
                <Typography
                    variant="h5"
                    fontWeight={700}
                    sx={{ color, lineHeight: 1.2 }}
                >
                    {value}
                </Typography>
            </Stack>

            {subtitle && (
                <Typography
                    variant="body2"
                    color="text. secondary"
                    mt={0.5}
                    fontSize={12}
                >
                    {subtitle}
                </Typography>
            )}
        </Card>
    );
};

export default StatCard;