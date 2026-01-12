import React from "react";
import { Avatar, Box, Button, FormControl, MenuItem, Select, Stack, Typography } from "@mui/material";
import { BoardMember } from "../../types";
import { getAvatarColorDifferent } from "../../utils/avatarColor";

const MemberList: React.FC<{
    members: BoardMember[];
    mainColor?: string;
    isAdmin?: boolean;
    onChangeRole?: (memberId: number, userId: number, role: string) => void;
    onRemove?: (memberId: number, userId: number) => void;
    currentUsername?: string;
    compact?: boolean;
}> = ({ members, mainColor, isAdmin, onChangeRole, onRemove, currentUsername, compact }) => {
    if (compact) {
        const firstTwo = members.slice(0, 2);
        const extra = members.length - firstTwo.length;
        return (
            <Box display="flex" alignItems="center" gap={0.5} mr={2}>
                {firstTwo.map((m) => (
                    <Avatar key={m.id} sx={{ bgcolor: getAvatarColorDifferent(m.user.username, mainColor), width: 32, height: 32, fontSize: 14 }}>
                        {m.user.username[0]?.toUpperCase()}
                    </Avatar>
                ))}
                {extra > 0 && (
                    <Typography fontSize={12} color="text.secondary">
                        +{extra}
                    </Typography>
                )}
            </Box>
        );
    }

    return (
        <Stack spacing={1.5}>
            {members.map((member) => (
                <Box key={member.id} border={1} borderColor="grey.200" borderRadius={1} p={2}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar sx={{ bgcolor: getAvatarColorDifferent(member.user.username, mainColor), width: 36, height: 36 }}>
                            {member.user.username[0]?.toUpperCase()}
                        </Avatar>
                        <Stack spacing={0}>
                            <Typography fontWeight={600}>{member.user.username}</Typography>
                            <Typography variant="caption" color="text.secondary">Role hiện tại: {member.role}</Typography>
                        </Stack>
                        <Box flexGrow={1} />
                        {isAdmin && (
                            <Stack direction="row" spacing={1}>
                                <FormControl size="small" sx={{ minWidth: 140 }}>
                                    <Select
                                        value={member.role}
                                        onChange={(e) => onChangeRole?.(member.id, member.user.id, e.target.value)}
                                        disabled={member.user.username === currentUsername}
                                    >
                                        <MenuItem value="ADMIN">ADMIN</MenuItem>
                                        <MenuItem value="MEMBER">MEMBER</MenuItem>
                                        <MenuItem value="VIEWER">VIEWER</MenuItem>
                                    </Select>
                                </FormControl>
                                <Button
                                    size="small"
                                    variant="outlined"
                                    color="error"
                                    onClick={() => onRemove?.(member.id, member.user.id)}
                                    disabled={member.user.username === currentUsername}
                                >
                                    Xóa
                                </Button>
                            </Stack>
                        )}
                    </Stack>
                </Box>
            ))}
        </Stack>
    );
};

export default MemberList;