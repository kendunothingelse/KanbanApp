// src/hooks/useKanbanDnd.ts
import { DragEndEvent, DragOverEvent, DragStartEvent, UniqueIdentifier } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { Card, List } from "../api/dummy-data";
import apiClient from "../api/api";
import React from "react";

export function useKanbanDnd(
    lists: List[],
    setLists: React.Dispatch<React.SetStateAction<List[]>>,
    setActiveCard: React.Dispatch<React.SetStateAction<Card | null>>
) {

    const findListByCardId = (cardId: UniqueIdentifier): List | undefined => {
        const cardIdNum = Number(String(cardId).replace('card-', ''));
        return lists.find(list => list.cards.some(card => card.id === cardIdNum));
    };

    const handleDragStart = (event: DragStartEvent) => {
        if (event.active.data.current?.type === "Card") {
            setActiveCard(event.active.data.current.card);
        }
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const isActiveACard = active.data.current?.type === "Card";
        if (!isActiveACard) return;

        const activeId = active.id;
        const overId = over.id;

        // Find the lists
        const activeList = findListByCardId(activeId);
        let overList: List | undefined;
        if (over.data.current?.type === "List") {
            const overListId = Number(String(overId).replace('list-', ''));
            overList = lists.find(l => l.id === overListId);
        } else if (over.data.current?.type === "Card") {
            overList = findListByCardId(overId);
        }

        if (!activeList || !overList || activeList.id === overList.id) {
            return;
        }

        // Move card to the new list
        setLists(prev => {
            const activeListIndex = prev.findIndex(l => l.id === activeList!.id);
            const overListIndex = prev.findIndex(l => l.id === overList!.id);

            const activeCard = active.data.current?.card as Card;

            const newActiveListCards = prev[activeListIndex].cards.filter(c => c.id !== activeCard.id);
            const newOverListCards = [...prev[overListIndex].cards, activeCard];

            const newLists = [...prev];
            newLists[activeListIndex] = { ...newLists[activeListIndex], cards: newActiveListCards };
            newLists[overListIndex] = { ...newLists[overListIndex], cards: newOverListCards };

            return newLists;
        });
    };

    const handleDragEnd = (event: DragEndEvent) => {
        setActiveCard(null);
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        // Handle List reordering
        if (active.data.current?.type === "List" && over.data.current?.type === "List" && activeId !== overId) {
            const oldIndex = lists.findIndex((l) => `list-${l.id}` === activeId);
            const newIndex = lists.findIndex((l) => `list-${l.id}` === overId);
            const newLists = arrayMove(lists, oldIndex, newIndex);
            setLists(newLists);
            apiClient.post('/lists/reorder', { orderedIds: newLists.map(l => l.id) })
                .catch(err => {
                    console.error("Failed to reorder lists, reverting.", err);
                    setLists(lists); // Revert on error
                });
            return;
        }

        // Handle Card reordering within a list
        if (active.data.current?.type === "Card" && over.data.current?.type === "Card" && activeId !== overId) {
            const activeList = findListByCardId(activeId);
            const overList = findListByCardId(overId);

            if (activeList && overList && activeList.id === overList.id) {
                const listIndex = lists.findIndex(l => l.id === activeList.id);
                const oldCardIndex = activeList.cards.findIndex(c => `card-${c.id}` === activeId);
                const newCardIndex = overList.cards.findIndex(c => `card-${c.id}` === overId);

                const reorderedCards = arrayMove(activeList.cards, oldCardIndex, newCardIndex);
                const newLists = [...lists];
                newLists[listIndex] = { ...newLists[listIndex], cards: reorderedCards };
                setLists(newLists);

                // API Call
                const cardIdNum = Number(String(activeId).replace('card-', ''));
                apiClient.post(`/cards/${cardIdNum}/move`, {
                    newListId: activeList.id,
                    orderedCardIds: reorderedCards.map(c => c.id)
                }).catch(err => {
                    console.error("Failed to reorder card, reverting.", err);
                    setLists(lists); // Revert on error
                });
            }
        }

        // Handle Card move to a new list (final state is set by dragOver, this just sends the API call)
        if (active.data.current?.type === "Card") {
            const finalActiveList = findListByCardId(activeId);
            if (finalActiveList) {
                const cardIdNum = Number(String(activeId).replace('card-', ''));
                apiClient.post(`/cards/${cardIdNum}/move`, {
                    newListId: finalActiveList.id,
                    orderedCardIds: finalActiveList.cards.map(c => c.id)
                }).catch(err => {
                    console.error("Failed to move card, consider reverting UI.", err);
                    // A more robust solution might involve refetching the board state
                });
            }
        }
    };

    return { handleDragStart, handleDragOver, handleDragEnd };
}
