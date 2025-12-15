import React, { useEffect, useState } from "react";
import api from "../../api/api";
import { Board, Workspace } from "../../types";
import { Box, Button, Flex, Heading, Input, List, ListItem, useToast, Select } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

export default function BoardListPage() {
    const [boards, setBoards] = useState<Board[]>([]);
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [name, setName] = useState("");
    const [wsId, setWsId] = useState<number | undefined>();
    const toast = useToast();
    const nav = useNavigate();

    const load = async () => {
        const res = await api.get("/boards/me");
        setBoards(res.data);
        const ws = await api.get("/workspaces");
        setWorkspaces(ws.data);
        if (ws.data?.length) setWsId(ws.data[0].id);
    };
    useEffect(() => { load(); }, []);

    const create = async () => {
        try {
            await api.post("/boards", { name, workspaceId: wsId });
            setName("");
            await load();
        } catch (e: any) {
            toast({ status: "error", title: e?.response?.data || e.message });
        }
    };

    return (
        <Box p="6">
            <Heading size="lg" mb="4">My Boards</Heading>
            <Flex gap="2" mb="4">
                <Input placeholder="Board name" value={name} onChange={e => setName(e.target.value)} />
                <Select value={wsId} onChange={e => setWsId(Number(e.target.value))}>
                    {workspaces.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </Select>
                <Button onClick={create}>Create</Button>
            </Flex>
            <List spacing="2">
                {boards.map(b => (
                    <ListItem key={b.id} p="3" borderWidth="1px" borderRadius="md" cursor="pointer"
                              onClick={() => nav(`/boards/${b.id}`)}>
                        <Flex justify="space-between"><Box>{b.name}</Box><Box>{b.workspace?.name}</Box></Flex>
                    </ListItem>
                ))}
            </List>
        </Box>
    );
}