import React, {useEffect, useState} from "react";
import {
    Avatar, Box, Button, Flex, Heading, SimpleGrid, Stack, Text,
    useDisclosure, useToast, Alert, AlertIcon, AlertTitle, AlertDescription,
    IconButton, HStack, Tooltip
} from "@chakra-ui/react";
import {CloseIcon} from "@chakra-ui/icons";
import {useAuth} from "../auth/AuthContext";
import api from "../api";
import {Board, Workspace} from "../types";
import CreateBoardModal from "../components/CreateBoardModal";
import {useNavigate} from "react-router-dom";
import CreateWorkspaceButton from "../components/CreateWorkspaceButton";
import {getAvatarColor, getAvatarColorDifferent} from "../utils/avatarColor";

type BoardWithMembers = Board & { members?: { id: number; user: { id: number; username: string } }[] };

const WorkspaceDashboard: React.FC = () => {
    const {user, logout} = useAuth();
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [boards, setBoards] = useState<BoardWithMembers[]>([]);
    const [selectedWs, setSelectedWs] = useState<number | null>(null);
    const toast = useToast();
    const {isOpen, onOpen, onClose} = useDisclosure();
    const nav = useNavigate();

    const loadBoards = async () => {
        const res = await api.get("/boards/me");
        const bs: BoardWithMembers[] = res.data;
        // nạp members cho từng board (có thể tối ưu bằng batch, ở đây gọi tuần tự)
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

    const loadWorkspaces = async () => {
        try {
            const res = await api.get("/workspaces");
            setWorkspaces(res.data);
            if (!selectedWs && res.data.length) setSelectedWs(res.data[0].id);
            if (selectedWs && !res.data.find((w: Workspace) => w.id === selectedWs)) {
                setSelectedWs(res.data[0]?.id ?? null);
            }
        } catch (e:any) {
            toast({status:"error", title:"Lỗi lấy workspace", description: e?.response?.data || e.message});
        }
    };

    useEffect(() => {
        loadWorkspaces();
        loadBoards();
    }, []);

    const handleBoardClick = (b: Board) => nav(`/boards/${b.id}`);

    const deleteWorkspace = async (id: number) => {
        try {
            await api.delete(`/workspaces/${id}`);
            toast({status:"success", title:"Đã xóa workspace"});
            await loadWorkspaces();
            await loadBoards();
        } catch (e:any) {
            toast({status:"error", title:"Xóa workspace thất bại", description: e?.response?.data || e.message});
        }
    };

    const deleteBoard = async (id: number) => {
        try {
            await api.delete(`/boards/${id}`);
            toast({status:"success", title:"Đã xóa board"});
            await loadBoards();
        } catch (e:any) {
            toast({status:"error", title:"Xóa board thất bại", description: e?.response?.data || e.message});
        }
    };

    const noWorkspace = workspaces.length === 0;
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

    return (
        <Box p="6">
            <Flex align="center" justify="space-between" mb="6">
                <Flex align="center" gap="3">
                    <Avatar name={user?.username} bg={mainColor} color="white" />
                    <Heading size="md">Workspace Dashboard</Heading>
                </Flex>
                <Flex gap="3">
                    <CreateWorkspaceButton onCreated={async () => { await loadWorkspaces(); await loadBoards(); }} />
                    <Button colorScheme="blue" onClick={onOpen} isDisabled={noWorkspace}>
                        Tạo board mới
                    </Button>
                    <Button onClick={logout} variant="outline">Đăng xuất</Button>
                </Flex>
            </Flex>

            {noWorkspace && (
                <Alert status="info" mb="4">
                    <AlertIcon />
                    <Box>
                        <AlertTitle>Chưa có workspace!</AlertTitle>
                        <AlertDescription>Hãy tạo workspace trước khi tạo board.</AlertDescription>
                    </Box>
                </Alert>
            )}

            <Stack direction="row" spacing="2" mb="4" wrap="wrap">
                {workspaces.map(ws => (
                    <HStack key={ws.id} borderWidth="1px" borderRadius="md" p="2">
                        <Button
                            variant={selectedWs === ws.id ? "solid" : "outline"}
                            onClick={() => setSelectedWs(ws.id)}
                            size="sm"
                        >
                            {ws.name}
                        </Button>
                        <IconButton
                            aria-label="Xóa workspace"
                            size="sm"
                            icon={<CloseIcon boxSize={2.5} />}
                            onClick={() => deleteWorkspace(ws.id)}
                        />
                    </HStack>
                ))}
            </Stack>

            <SimpleGrid columns={[1, 2, 3]} spacing="4">
                {boards
                    .filter(b => !selectedWs || b.workspace?.id === selectedWs)
                    .map(b => (
                        <Box key={b.id} borderWidth="1px" borderRadius="md" p="4"
                             _hover={{shadow: "md", cursor: "pointer"}}
                             onClick={() => handleBoardClick(b)}>
                            <Flex justify="space-between" align="center" mb="2">
                                <Heading size="md">{b.name}</Heading>
                                <IconButton
                                    aria-label="Xóa board"
                                    size="sm"
                                    icon={<CloseIcon boxSize={2.5} />}
                                    onClick={(e) => { e.stopPropagation(); deleteBoard(b.id); }}
                                />
                            </Flex>
                            <Text fontSize="sm" color="gray.500">Workspace #{b.workspace?.id}</Text>
                            {renderMembers(b.members)}
                        </Box>
                    ))
                }
            </SimpleGrid>

            <CreateBoardModal
                isOpen={isOpen}
                onClose={onClose}
                workspaceId={selectedWs ?? -1}
                onCreated={async () => { await loadBoards(); await loadWorkspaces(); }}
            />
        </Box>
    );
};

export default WorkspaceDashboard;