import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/api";
import { Board, Card, Column, Member } from "../types";
import {
    Box, Button, Flex, Heading, Input, Select, Stack, Text, useToast, Tag, HStack, Divider
} from "@chakra-ui/react";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, useSortable, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const SortableCard: React.FC<{ card: Card; children: React.ReactNode }> = ({ card, children }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: card.id });
    const style = { transform: CSS.Translate.toString(transform), transition };
    return <Box ref={setNodeRef} style={style} {...attributes} {...listeners}>{children}</Box>;
};

export default function BoardPage() {
    const { id } = useParams();
    const boardId = Number(id);
    const [board, setBoard] = useState<Board | null>(null);
    const [columns, setColumns] = useState<Column[]>([]);
    const [cards, setCards] = useState<Card[]>([]);
    const [members, setMembers] = useState<Member[]>([]);
    const [colName, setColName] = useState("");
    const [cardTitle, setCardTitle] = useState("");
    const [cardDesc, setCardDesc] = useState("");
    const [priority, setPriority] = useState<"LOW"|"MEDIUM"|"HIGH">("MEDIUM");
    const [due, setDue] = useState<Date | null>(null);
    const [targetCol, setTargetCol] = useState<number | undefined>();
    const [inviteUserId, setInviteUserId] = useState<number | undefined>();
    const [inviteRole, setInviteRole] = useState<string>("MEMBER");
    const toast = useToast();

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

    const load = async () => {
        const bres = await api.get("/boards/me");
        const found = (bres.data as Board[]).find(b => b.id === boardId);
        if (found) setBoard(found);

        const colRes = await api.get(`/boards/${boardId}/columns`);
        const cardRes = await api.get(`/boards/${boardId}/cards`);
        const memRes = await api.get(`/boards/${boardId}/members`);
        setColumns(colRes.data);
        setCards(cardRes.data);
        setMembers(memRes.data);
        if (colRes.data?.length) setTargetCol(colRes.data[0].id);
    };

    useEffect(() => { load(); }, [boardId]);

    const createCol = async () => {
        try {
            await api.post("/columns", { boardId, name: colName, position: columns.length });
            setColName("");
            load();
        } catch (e: any) { toast({ status: "error", title: e?.response?.data || e.message }); }
    };

    const createCard = async () => {
        if (!targetCol) return;
        try {
            await api.post("/cards", {
                columnId: targetCol,
                title: cardTitle,
                description: cardDesc,
                position: cards.filter(c => c.column.id === targetCol).length,
                dueDate: due ? due.toISOString().slice(0, 10) : null,
                priority
            });
            setCardTitle(""); setCardDesc(""); setDue(null);
            load();
        } catch (e: any) { toast({ status: "error", title: e?.response?.data || e.message }); }
    };

    const onDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over) return;
        const activeCard = cards.find(c => c.id === Number(active.id));
        const overCard = cards.find(c => c.id === Number(over.id));
        if (!activeCard || !overCard) return;

        const sameColumn = activeCard.column.id === overCard.column.id;
        const newCards = [...cards];
        const idxFrom = newCards.findIndex(c => c.id === activeCard.id);
        const idxTo = newCards.findIndex(c => c.id === overCard.id);
        const moved = arrayMove(newCards, idxFrom, idxTo);

        const targetColumnId = sameColumn ? activeCard.column.id : overCard.column.id;
        let pos = 0;
        moved.filter(c => c.column.id === targetColumnId)
            .forEach(c => c.position = pos++);

        setCards(moved);
        await api.post("/cards/move", {
            cardId: activeCard.id,
            targetColumnId,
            targetPosition: overCard.position
        }).catch(e => toast({ status: "error", title: e?.response?.data || e.message }));
        load();
    };

    const invite = async () => {
        if (!inviteUserId) return;
        try {
            await api.post("/boards/invite", { boardId, userId: inviteUserId, role: inviteRole });
            load();
        } catch (e: any) { toast({ status: "error", title: e?.response?.data || e.message }); }
    };

    const cardsByColumn = useMemo(() => {
        const map: Record<number, Card[]> = {};
        cards.forEach(c => {
            const colId = c.column.id;
            map[colId] = map[colId] || [];
            map[colId].push(c);
        });
        Object.values(map).forEach(arr => arr.sort((a, b) => a.position - b.position));
        return map;
    }, [cards]);

    return (
        <Box p="6">
            <Heading size="lg" mb="4">{board?.name || `Board #${boardId}`}</Heading>

            <HStack align="start" spacing="6" mb="6">
                <Box borderWidth="1px" p="4" rounded="md" minW="250px">
                    <Text fontWeight="bold" mb="2">Invite member (ADMIN)</Text>
                    <Input placeholder="User ID" type="number" value={inviteUserId || ""} onChange={e => setInviteUserId(Number(e.target.value))} mb="2" />
                    <Select value={inviteRole} onChange={e => setInviteRole(e.target.value)} mb="2">
                        <option>ADMIN</option><option>MEMBER</option><option>VIEWER</option>
                    </Select>
                    <Button onClick={invite}>Invite</Button>
                    <Divider my="3" />
                    <Text fontWeight="bold">Members</Text>
                    {members.map((m, i) => (
                        <Box key={i} p="2" borderWidth="1px" rounded="md" mt="2">
                            {m.user?.username} - <Tag>{m.role}</Tag>
                        </Box>
                    ))}
                </Box>

                <Box borderWidth="1px" p="4" rounded="md" minW="240px">
                    <Text fontWeight="bold" mb="2">Create Column</Text>
                    <Input placeholder="Column name" value={colName} onChange={e => setColName(e.target.value)} mb="2" />
                    <Button onClick={createCol}>Add Column</Button>
                </Box>

                <Box borderWidth="1px" p="4" rounded="md" minW="260px">
                    <Text fontWeight="bold" mb="2">Create Card</Text>
                    <Select value={targetCol} onChange={e => setTargetCol(Number(e.target.value))} mb="2">
                        {columns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </Select>
                    <Input placeholder="Title" value={cardTitle} onChange={e => setCardTitle(e.target.value)} mb="2" />
                    <Input placeholder="Description" value={cardDesc} onChange={e => setCardDesc(e.target.value)} mb="2" />
                    <Select value={priority} onChange={e => setPriority(e.target.value as any)} mb="2">
                        <option>LOW</option><option>MEDIUM</option><option>HIGH</option>
                    </Select>
                    <Box mb="2">
                        <DatePicker selected={due} onChange={d => setDue(d)} placeholderText="Due date" />
                    </Box>
                    <Button onClick={createCard}>Add Card</Button>
                </Box>
            </HStack>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                <Flex align="start" gap="4" overflowX="auto">
                    {columns.sort((a, b) => a.position - b.position).map(col => (
                        <Box key={col.id} minW="260px" borderWidth="1px" p="3" rounded="md" bg="gray.50">
                            <Heading size="sm" mb="2">{col.name}</Heading>
                            <SortableContext items={(cardsByColumn[col.id] || []).map(c => c.id)} strategy={verticalListSortingStrategy}>
                                <Stack spacing="2">
                                    {(cardsByColumn[col.id] || []).map(card => (
                                        <SortableCard key={card.id} card={card}>
                                            <Box p="3" bg="white" shadow="sm" borderWidth="1px" rounded="md">
                                                <Text fontWeight="bold">{card.title}</Text>
                                                <Text fontSize="sm" noOfLines={2}>{card.description}</Text>
                                                {card.dueDate && <Tag mt="1" colorScheme="blue">Due: {card.dueDate}</Tag>}
                                                {card.priority && <Tag mt="1" colorScheme="purple">P: {card.priority}</Tag>}
                                            </Box>
                                        </SortableCard>
                                    ))}
                                </Stack>
                            </SortableContext>
                        </Box>
                    ))}
                </Flex>
            </DndContext>
        </Box>
    );
}