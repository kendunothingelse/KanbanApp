import React, {useEffect, useMemo, useState} from "react";
import {
    Avatar, Box, Button, Flex, Heading, SimpleGrid, Stack, Text,
    useDisclosure, useToast, Alert, AlertIcon, AlertTitle, AlertDescription,
    IconButton, HStack, Tooltip, Input
} from "@chakra-ui/react";
import {CloseIcon} from "@chakra-ui/icons";
import {useAuth} from "../auth/AuthContext";
import api from "../api";
import {Board, Workspace} from "../types";
import CreateBoardModal from "../components/CreateBoardModal";
import {useNavigate} from "react-router-dom";
import CreateWorkspaceButton from "../components/CreateWorkspaceButton";
import {getAvatarColor, getAvatarColorDifferent} from "../utils/avatarColor";
import {Badge} from "@chakra-ui/react";

type BoardWithMembers = Board & { members?: { id: number; user: { id: number; username: string } }[] };
const MAIN_WS: Workspace = {id: 0, name: "Tất cả board"};

const WorkspaceDashboard: React.FC = () => {
    const {user, logout} = useAuth();
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [boards, setBoards] = useState<BoardWithMembers[]>([]);
    const [selectedWs, setSelectedWs] = useState<number | null>(null);
    const [wsSearch, setWsSearch] = useState("");
    const toast = useToast();
    const {isOpen, onOpen, onClose} = useDisclosure();
    const nav = useNavigate();

    const loadBoards = async () => {
        const res = await api.get("/boards/me");
        const bs: BoardWithMembers[] = res.data;
        const withMembers = await Promise.all(bs.map(async b => {
            try {
                const memRes = await api.get(`/boards/${b.id}/members`);
                return {...b, members: memRes.data};
            } catch {
                return {...b, members: []};
            }
        }));
        setBoards(withMembers);
    };

    const loadOwnedWorkspaces = async () => {
        try {
            const res = await api.get("/workspaces");
            const list: Workspace[] = [MAIN_WS, ...res.data];
            setWorkspaces(list);
            if (selectedWs === null) setSelectedWs(MAIN_WS.id);
            if (selectedWs && !list.find(w => w.id === selectedWs)) {
                setSelectedWs(MAIN_WS.id);
            }
        } catch (e: any) {
            toast({status: "error", title: "Lỗi lấy workspace", description: e?.response?.data || e.message});
        }
    };

    // search workspaces from backend, but keep MAIN_WS on top
    const searchWorkspaces = async (q: string) => {
        if (!q.trim()) {
            await loadOwnedWorkspaces();
            return;
        }
        try {
            const res = await api.get(`/workspaces/search?q=${encodeURIComponent(q)}`);
            setWorkspaces([MAIN_WS, ...res.data]);
        } catch (e: any) {
            toast({status: "error", title: "Lỗi tìm workspace", description: e?.response?.data || e.message});
        }
    };

    useEffect(() => {
        loadOwnedWorkspaces();
        loadBoards();
    }, []);

    useEffect(() => {
        searchWorkspaces(wsSearch);
    }, [wsSearch]);

    const handleBoardClick = (b: Board) => nav(`/boards/${b.id}`);

    const deleteWorkspace = async (id: number) => {
        if (id === MAIN_WS.id) return;
        try {
            await api.delete(`/workspaces/${id}`);
            toast({status: "success", title: "Đã xóa workspace"});
            await loadOwnedWorkspaces();
            await loadBoards();
        } catch (e: any) {
            toast({status: "error", title: "Xóa workspace thất bại", description: e?.response?.data || e.message});
        }
    };

    const deleteBoard = async (id: number) => {
        try {
            await api.delete(`/boards/${id}`);
            toast({status: "success", title: "Đã xóa board"});
            await loadBoards();
        } catch (e: any) {
            toast({status: "error", title: "Xóa board thất bại", description: e?.response?.data || e.message});
        }
    };

    const noWorkspaceOwned = workspaces.filter(w => w.id !== MAIN_WS.id).length === 0;
    const mainColor = getAvatarColor(user?.username);

    const renderMembers = (members?: { id: number; user: { username: string } }[]) => {
        if (!members || !members.length) return null;
        const firstTwo = members.slice(0, 2);
        const extra = members.length - firstTwo.length;
        return (
            <Flex mt="2" align="center" gap="1">
                {firstTwo.map(m => (
                    <Tooltip key={m.id} label={m.user.username} hasArrow>
                        <Avatar
                            size="xs"
                            name={m.user.username}
                            bg={getAvatarColorDifferent(m.user.username, mainColor)}
                            color="white"
                        />
                    </Tooltip>
                ))}
                {extra > 0 && (
                    <Tooltip label={members.slice(2).map(m => m.user.username).join(", ")} hasArrow>
                        <Text fontSize="xs" color="gray.600">và còn +{extra} người khác</Text>
                    </Tooltip>
                )}
            </Flex>
        );
    };

    const statusBadge = (status?: string) => {
        if (!status) return null;
        const color = status === "DONE" ? "green" : "yellow";
        return (
            <Badge ml="2" colorScheme={color}>
                {status === "DONE" ? "DONE" : "IN PROGRESS"}
            </Badge>
        );
    };
    return (
        <Box p="6">
            <Flex align="center" justify="space-between" mb="6">
                <Flex align="center" gap="3">
                    <Avatar name={user?.username} bg={mainColor} color="white"/>
                    <Heading size="md">Workspace Dashboard</Heading>
                </Flex>
                <Flex gap="3">
                    <CreateWorkspaceButton onCreated={async () => {
                        await loadOwnedWorkspaces();
                        await loadBoards();
                    }}/>
                    <Button colorScheme="blue" onClick={onOpen} isDisabled={noWorkspaceOwned}>
                        Tạo board mới
                    </Button>
                    <Button onClick={logout} variant="outline">Đăng xuất</Button>
                </Flex>
            </Flex>

            <Input
                placeholder="Tìm kiếm workspace"
                value={wsSearch}
                onChange={(e) => setWsSearch(e.target.value)}
                mb="3"
            />

            {noWorkspaceOwned && (
                <Alert status="info" mb="4">
                    <AlertIcon/>
                    <Box>
                        <AlertTitle>Chưa có workspace!</AlertTitle>
                        <AlertDescription>Hãy tạo workspace trước khi tạo board.</AlertDescription>
                    </Box>
                </Alert>
            )}

            <Box borderWidth="1px" borderRadius="md" p="2" maxH="220px" overflowY="auto" mb="4">
                <Stack direction="row" spacing="2" wrap="wrap">
                    {workspaces.map(ws => (
                        <HStack key={ws.id} borderWidth="1px" borderRadius="md" p="2">
                            <Button
                                variant={selectedWs === ws.id ? "solid" : "outline"}
                                onClick={() => setSelectedWs(ws.id)}
                                size="sm"
                            >
                                {ws.name}
                            </Button>
                            {ws.id !== MAIN_WS.id && (
                                <IconButton
                                    aria-label="Xóa workspace"
                                    size="sm"
                                    icon={<CloseIcon boxSize={2.5}/>}
                                    onClick={() => deleteWorkspace(ws.id)}
                                />
                            )}
                        </HStack>
                    ))}
                </Stack>
            </Box>

            <SimpleGrid columns={[1, 2, 3]} spacing="4">
                {boards
                    .filter(b => selectedWs === null
                        ? true
                        : selectedWs === MAIN_WS.id
                            ? true
                            : b.workspace?.id === selectedWs)
                    .map(b => (
                        <Box key={b.id} borderWidth="1px" borderRadius="md" p="4"
                             _hover={{shadow: "md", cursor: "pointer"}}
                             onClick={() => handleBoardClick(b)}>
                            <Flex justify="space-between" align="center" mb="2">
                                <Heading size="md">{b.name}
                                    {statusBadge(b.status)}</Heading>
                                <IconButton
                                    aria-label="Xóa board"
                                    size="sm"
                                    icon={<CloseIcon boxSize={2.5}/>}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteBoard(b.id);
                                    }}
                                />
                            </Flex>
                            <Text fontSize="sm" color="gray.500">
                                Workspace #{b.workspace?.id ?? "?"}
                            </Text>
                            {renderMembers(b.members)}
                        </Box>
                    ))
                }
            </SimpleGrid>

            <CreateBoardModal
                isOpen={isOpen}
                onClose={onClose}
                workspaceId={selectedWs ?? -1}
                onCreated={async () => {
                    await loadBoards();
                    await loadOwnedWorkspaces();
                }}
            />
        </Box>
    );
};

export default WorkspaceDashboard;