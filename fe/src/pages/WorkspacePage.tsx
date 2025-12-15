import React, { useEffect, useState } from "react";
import api from "../api/api";
import { Workspace } from "../types";
import { Box, Button, Heading, Input, Stack, List, ListItem, Flex, useToast } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

export default function WorkspacePage() {
    const [items, setItems] = useState<Workspace[]>([]);
    const [name, setName] = useState("");
    const toast = useToast();
    const nav = useNavigate();

    const load = async () => {
        const res = await api.get("/workspaces");
        setItems(res.data);
    };
    useEffect(() => { load(); }, []);

    const create = async () => {
        try {
            await api.post("/workspaces", { name });
            setName("");
            await load();
        } catch (e: any) {
            toast({ status: "error", title: e?.response?.data || e.message });
        }
    };

    return (
        <Box p="6">
            <Heading size="lg" mb="4">Workspaces</Heading>
            <Stack direction="row" gap="2" mb="4">
                <Input placeholder="Workspace name" value={name} onChange={e => setName(e.target.value)} />
                <Button onClick={create}>Create</Button>
                <Button onClick={() => nav("/boards")}>My Boards</Button>
            </Stack>
            <List spacing="2">
                {items.map(ws => (
                    <ListItem key={ws.id} p="2" borderWidth="1px" borderRadius="md">
                        <Flex justify="space-between">
                            <Box>{ws.name}</Box>
                            <Button size="sm" onClick={() => nav("/boards")}>Boards</Button>
                        </Flex>
                    </ListItem>
                ))}
            </List>
        </Box>
    );
}