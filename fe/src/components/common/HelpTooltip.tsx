import React from "react";
import { Tooltip, IconButton, Zoom } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { palette } from "../../theme/colors";

interface Props {
    title: string;
    placement?: "top" | "bottom" | "left" | "right";
}

// Tooltip giải thích nhanh, dùng icon nhỏ gọn
const HelpTooltip: React.FC<Props> = ({ title, placement = "top" }) => (
    <Tooltip
        title={title}
        placement={placement}
        arrow
        TransitionComponent={Zoom}
        componentsProps={{
            tooltip: {
                sx: { bgcolor: palette.secondary.dark, fontSize: 13, p: 1.5, maxWidth: 260, lineHeight: 1.5 },
            },
        }}
    >
        <IconButton size="small" sx={{ color: palette.text.disabled, ml: 0.5, p: 0.5 }}>
            <InfoOutlinedIcon fontSize="small" sx={{ fontSize: 16 }} />
        </IconButton>
    </Tooltip>
);

export default HelpTooltip;