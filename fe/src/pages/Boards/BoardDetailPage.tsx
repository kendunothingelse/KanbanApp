import React, { useEffect, useMemo, useState } from "react";
import {
    Box, Button, Flex, Heading, Input, Stack, SimpleGrid, useToast, Select,
} from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import { DndContext, DragEndEvent, DragOverlay, closestCorners } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import api from "../../api/api";
import { endpoints } from "../../api/endpoints";
import { Board, Column as ColumnType, Card as CardType, User } from "../../types";
import Layout from "../../components/Layout";
import Column from "../../components/Board/Column";
import CardItem from "../../components/Board/CardItem";

type BoardDetailState = {
    board?: Board;
    columns: ColumnType[];
    cards: CardType[];
    users: User[]; // để assign
};

const BoardDetailPage: React.FC = () => {
    const { boardId } = useParams();
    const toast = useToast();
    const [state, setState] = useState<BoardDetailState>({ columns: [], cards: [], users: [] });
    const [colName, setColName] = useState("");
    const [cardTitle, setCardTitle] = useState("");
    const [cardDesc, setCardDesc] = useState("");
    const [selectedColumn, setSelectedColumn] = useState<number | null>(null);
    const [selectedUser, setSelectedUser] = useState<number | null>(null);
    const [selectedCard, setSelectedCard] = useState<number | null>(null);

    const fetchData = async () => {
        // Giả định backend có các endpoint GET; nếu chưa có bạn cần bổ sung.
        const [boardRes, columnsRes, cardsRes, usersRes] = await Promise.all([
            api.get(`/boards/${boardId}`), // cần bổ sung backend GET board detail
            api.get(`/boards/${boardId}/columns`), // cần bổ sung backend list columns by board
            api.get(`/boards/${boardId}/cards`),    // cần bổ sung backend list cards by board
            api.get(`/users`), // hoặc một endpoint list user, tùy bạn triển khai
        ]);
        setState({
            board: boardRes.data,
            columns: columnsRes.data,
            cards: cardsRes.data,
            users: usersRes.data,
        });
        if (columnsRes.data?.length) setSelectedColumn(columnsRes.data[0].id);
    };

    useEffect(() => {
        fetchData().catch(() => toast({ status: "error", title: "Load data failed" }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [boardId]);

    const cardsByColumn = useMemo(() => {
        const map: Record<number, CardType[]> = {};
        state.columns.forEach((c) => (map[c.id] = []));
        state.cards.forEach((c) => {
            map[c.columnId] = map[c.columnId] || [];
            map[c.columnId].push(c);
        });
        // sort by position
        Object.values(map).forEach((arr) => arr.sort((a, b) => a.position - b.position));
        return map;
    }, [state.cards, state.columns]);

    const createColumn = async () => {
        if (!colName) return;
        await api.post(endpoints.columns.create, {
            boardId: Number(boardId),
            name: colName,
            position: state.columns.length,
        });
        setColName("");
        fetchData();
    };

    const createCard = async () => {
        if (!cardTitle || !selectedColumn) return;
        await api.post(endpoints.cards.create, {
            columnId: selectedColumn,
            title: cardTitle,
            description: cardDesc,
            position: cardsByColumn[selectedColumn]?.length ?? 0,
        });
        setCardTitle("");
        setCardDesc("");
        fetchData();
    };

    const assignCard = async () => {
        if (!selectedCard || !selectedUser) return;
        await api.post(endpoints.cards.assign, {
            cardId: selectedCard,
            userId: selectedUser,
        });
        toast({ status: "success", title: "Assigned" });
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!active || !over) return;
        const cardId = Number(String(active.id).replace("card-", ""));
        const overColumnId = Number(String(over.id).replace("column-", ""));
        const targetColumnId = overColumnId;

        const targetPosition = (cardsByColumn[targetColumnId]?.length ?? 0);
        await api.post(endpoints.cards.move, {
            cardId,
            targetColumnId,
            targetPosition,
        });
        fetchData();
    };

    return (
        <Layout>
            <Heading mb={4}>{state.board?.name ?? "Board"}</Heading>

            <Flex gap={4} mb={6} flexWrap="wrap">
                <Stack direction="row" spacing={2}>
                    <Input placeholder="New column" value={colName} onChange={(e) => setColName(e.target.value)} />
                    <Button onClick={createColumn} colorScheme="blue">Add Column</Button>
                </Stack>

                <Stack direction="row" spacing={2}>
                    <Input placeholder="Card title" value={cardTitle} onChange={(e) => setCardTitle(e.target.value)} />
                    <Input placeholder="Card description" value={cardDesc} onChange={(e) => setCardDesc(e.target.value)} />
                    <Select value={selectedColumn ?? ""} onChange={(e) => setSelectedColumn(Number(e.target.value))}>
                        {state.columns.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </Select>
                    <Button onClick={createCard} colorScheme="green">Add Card</Button>
                </Stack>

                <Stack direction="row" spacing={2} align="center">
                    <Select placeholder="Select card" value={selectedCard ?? ""} onChange={(e) => setSelectedCard(Number(e.target.value))}>
                        {state.cards.map((c) => (
                            <option key={c.id} value={c.id}>{c.title}</option>
                        ))}
                    </Select>
                    <Select placeholder="Assign to" value={selectedUser ?? ""} onChange={(e) => setSelectedUser(Number(e.target.value))}>
                        {state.users.map((u) => (
                            <option key={u.id} value={u.id}>{u.username}</option>
                        ))}
                    </Select>
                    <Button onClick={assignCard} colorScheme="purple">Assign</Button>
                </Stack>
            </Flex>

            <DndContext collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
                <SimpleGrid columns={[1, 2, 3, 4]} spacing={4} alignItems="start">
                    {state.columns.map((col) => (
                        <SortableContext
                            key={col.id}
                            items={cardsByColumn[col.id]?.map((c) => `card-${c.id}`) ?? []}
                            strategy={verticalListSortingStrategy}
                        >
                            <Column column={col} cards={cardsByColumn[col.id] ?? []} />
                        </SortableContext>
                    ))}
                </SimpleGrid>
                <DragOverlay>{/* có thể hiển thị overlay card khi kéo nếu muốn */}</DragOverlay>
            </DndContext>
        </Layout>
    );
};

export default BoardDetailPage;