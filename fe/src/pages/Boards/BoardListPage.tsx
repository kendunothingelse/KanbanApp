import React, { useEffect, useState } from "react";
import { Box, Button, Heading, Input, Stack, SimpleGrid, Card as CCard, CardBody, Text, Select } from "@chakra-ui/react";
import client from "../../api/client";
import { endpoints } from "../../api/endpoints";
import { Board, Workspace } from "../../types";
import Layout from "../../components/Layout";

const BoardListPage: React.FC = () => {
    const [boards, setBoards] = useState<Board[]>([]);
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [name, setName] = useState("");
    const [workspaceId, setWorkspaceId] = useState<number | undefined>();

    const fetchBoards = async () => {
        const res = await client.get(endpoints.boards.list);
        setBoards(res.data);
    };

    const fetchWorkspaces = async () => {
        const res = await client.get(endpoints.workspace.list);
        setWorkspaces(res.data);
        if (res.data?.length) setWorkspaceId(res.data[0].id);
    };

    useEffect(() => {
        fetchBoards();
        fetchWorkspaces();
    }, []);

    const createBoard = async () => {
        if (!workspaceId) return;
        await client.post(endpoints.boards.create, { name, workspaceId });
        setName("");
        fetchBoards();
    };

    return (
        <Layout>
            <Heading mb={4}>Boards</Heading>
            <Stack direction="row" spacing={3} mb={4}>
                <Input placeholder="Board name" value={name} onChange={(e) => setName(e.target.value)} />
                <Select value={workspaceId} onChange={(e) => setWorkspaceId(Number(e.target.value))}>
                    {workspaces.map((w) => (
                        <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                </Select>
                <Button colorScheme="blue" onClick={createBoard}>Create</Button>
            </Stack>

            <SimpleGrid columns={[1, 2, 3]} spacing={4}>
                {boards.map((b) => (
                    <CCard as="a" href={`/boards/${b.id}`} key={b.id} _hover={{ shadow: "md" }}>
                        <CardBody>
                            <Heading size="md">{b.name}</Heading>
                            <Text fontSize="sm" color="gray.500">Workspace: {b.workspace?.name ?? b.workspace?.id}</Text>
                        </CardBody>
                    </CCard>
                ))}
            </SimpleGrid>
        </Layout>
    );
};

export default BoardListPage;