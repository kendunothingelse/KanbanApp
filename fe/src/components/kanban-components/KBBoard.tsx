// src/components/kanban-components/KBBoard.tsx
import { useEffect, useState } from "react";
import { Box, Flex, useDisclosure } from "@chakra-ui/react";
import {
    DndContext,
    PointerSensor,
    useSensor,
    useSensors,
    closestCorners,
} from "@dnd-kit/core";
import { SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import { KBColumn } from "./KBColumn";
import { Card, List, Label, Board, Member } from "../../api/dummy-data";
import { CardDetailModal } from "../workspace-components/CardDetailModal";
import apiClient from "../../api/api";
import { NewListCreator } from "./NewListCreator";
import { useKanbanDnd } from "../../hooks/useKanbanDnd";

interface KBBoardProps {
    initialBoard: Board;
    onAddList: (title: string) => void;
}

export function KBBoard({ initialBoard, onAddList }: KBBoardProps) {
    const [board, setBoard] = useState<Board>(initialBoard);
    const [lists, setLists] = useState<List[]>(initialBoard.lists || []);
    const [labels, setLabels] = useState<Label[]>([]);
    const [members, setMembers] = useState<Member[]>([]);
    const [activeCard, setActiveCard] = useState<Card | null>(null);
    const [selectedCard, setSelectedCard] = useState<Card | null>(null);
    const { isOpen, onOpen, onClose } = useDisclosure();

    const { handleDragStart, handleDragOver, handleDragEnd } = useKanbanDnd(lists, setLists, setActiveCard);

    useEffect(() => {
        setLists(initialBoard.lists || []);
    }, [initialBoard.lists]);

    useEffect(() => {
        // Fetch all labels and members for the workspace/board
        apiClient.get<Label[]>('/labels').then(res => setLabels(res.data));
        apiClient.get<Member[]>('/members').then(res => setMembers(res.data));
    }, []);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 15,
            },
        })
    );

    const handleCardClick = (card: Card) => {
        setSelectedCard(card);
        onOpen();
    };

    const handleUpdateCard = (updatedCard: Card) => {
        const newLists = lists.map(list => ({
            ...list,
            cards: list.cards.map(card => card.id === updatedCard.id ? updatedCard : card)
        }));
        setLists(newLists);
        if (selectedCard?.id === updatedCard.id) {
            setSelectedCard(updatedCard);
        }
    };

    const handleCreateLabel = (name: string, color: string) => {
        apiClient.post<Label>('/labels', { name, color }).then(response => {
            setLabels(prev => [...prev, response.data]);
        });
    };

    const handleUpdateLabel = (updatedLabel: Label) => {
        apiClient.put<Label>(`/labels/${updatedLabel.id}`, updatedLabel).then(response => {
            setLabels(prev => prev.map(l => l.id === response.data.id ? response.data : l));
            // Also update the label on all cards that use it
            setLists(prevLists => prevLists.map(list => ({
                ...list,
                cards: list.cards.map(card => ({
                    ...card,
                    labels: card.labels?.map(l => l.id === response.data.id ? response.data : l)
                }))
            })));
        });
    };

    const handleAddCard = (listId: number, cardTitle: string) => {
        const newCard = {
            title: cardTitle,
            list: { id: listId } // Nest list object for backend binding
        };

        apiClient.post<Card>('/cards', newCard).then(response => {
            const newLists = lists.map(list => {
                if (list.id === listId) {
                    return {
                        ...list,
                        cards: [...(list.cards || []), response.data]
                    };
                }
                return list;
            });
            setLists(newLists);
        });
    };

    return (
        <>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                <Flex gap={4} align="flex-start" overflowX="auto" p={4} h="100%">
                    {/* Prefix list IDs */}
                    <SortableContext items={lists.map(l => `list-${l.id}`)} strategy={horizontalListSortingStrategy}>
                        {lists.map((list) => (
                            <KBColumn
                                key={list.id}
                                list={list}
                                onCardClick={handleCardClick}
                                onAddCard={handleAddCard}
                            />
                        ))}
                    </SortableContext>
                    <Box flexShrink={0}>
                        <NewListCreator onAddList={onAddList} />
                    </Box>
                </Flex>
            </DndContext>
            <CardDetailModal
                isOpen={isOpen}
                onClose={onClose}
                card={selectedCard}
                onUpdateCard={handleUpdateCard}
                allLabels={labels}
                allMembers={members}
                onCreateLabel={handleCreateLabel}
                onUpdateLabel={handleUpdateLabel}
            />
        </>
    );
}
