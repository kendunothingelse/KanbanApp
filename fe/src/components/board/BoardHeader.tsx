import React from "react";
import { Stack, IconButton, Typography, Chip, Button, Box } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import { Board, BoardMember } from "../../types";
import MemberList from "./MemberList";
import { palette } from "../../theme/colors";

interface BoardHeaderProps {
    board: Board | null;
    members: BoardMember[];
    mainColor:  string;
    isAdmin: boolean;
    onEditBoard: () => void;
    onInvite: () => void;
}

const BoardHeader:  React.FC<BoardHeaderProps> = ({
                                                      board,
                                                      members,
                                                      mainColor,
                                                      isAdmin,
                                                      onEditBoard,
                                                      onInvite,
                                                  }) => {
    const navigate = useNavigate();

    const statusChip = (status?:  string) => {
        if (!status) return null;
        const isDone = status === "DONE";
        return (
            <Chip
                size="small"
                label={isDone ?  "DONE" : "IN PROGRESS"}
                sx={{
                    ml: 1,
                    bgcolor: isDone ? palette.secondary.main : palette. warning.main,
                    color: palette.text.primary,
                    fontWeight: 600,
                }}
            />
        );
    };

    return (
        <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems="center"
            justifyContent="space-between"
            mb={2}
        >
            <Stack direction="row" spacing={1} alignItems="center">
                <IconButton
                    aria-label="Quay lại"
                    size="small"
                    onClick={() => navigate("/workspaces")}
                    sx={{ color: palette.text. primary }}
                >
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h5" fontWeight={700} color="text.primary">
                    {board?.name || "Loading..."}
                </Typography>
                {statusChip(board?. status)}
            </Stack>

            <Stack spacing={0.5} textAlign={{ xs: "left", md: "right" }}>
                {board?.createdAt && (
                    <Typography variant="body2" color="text.secondary">
                        Created: {board.createdAt. slice(0, 10)}
                    </Typography>
                )}
                {board?.endDate && (
                    <Typography variant="body2" color="text.secondary">
                        Deadline: {board.endDate}
                    </Typography>
                )}
                {board?.wipLimit && (
                    <Typography variant="body2" color="text.secondary">
                        WIP limit: {board.wipLimit}
                    </Typography>
                )}
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
                <MemberList members={members} mainColor={mainColor} compact />
                {isAdmin && (
                    <Button
                        variant="outlined"
                        onClick={onEditBoard}
                        sx={{
                            borderColor: palette.secondary. main,
                            color: palette.text.primary,
                            "&:hover":  {
                                borderColor: palette.secondary.dark,
                                bgcolor: `${palette.secondary. light}33`,
                            },
                        }}
                    >
                        Sửa board
                    </Button>
                )}
                <Button
                    variant="contained"
                    onClick={onInvite}
                    sx={{
                        bgcolor: palette.primary. main,
                        "&:hover": { bgcolor: palette.primary.dark },
                    }}
                >
                    Mời thành viên
                </Button>
            </Stack>
        </Stack>
    );
};

export default BoardHeader;