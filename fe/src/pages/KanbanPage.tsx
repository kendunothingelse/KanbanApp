// src/pages/KanbanPage.tsx
import { Box, Container, Heading, Spinner, Text } from "@chakra-ui/react";
import { KBBoard } from "../components/kanban-components/KBBoard";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Board, List } from "../api/dummy-data";
import apiClient from "../api/api";

export default function KanbanPage() {
    const { boardId } = useParams<{ boardId: string }>();
    const [board, setBoard] = useState<Board | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (boardId) {
            setLoading(true);
            apiClient.get<Board>(`/boards/${boardId}`)
                .then(response => {
                    // Ensure lists is always an array
                    const boardData = response.data;
                    if (!boardData.lists) {
                        boardData.lists = [];
                    }
                    setBoard(boardData);
                    setLoading(false);
                })
                .catch(err => {
                    console.error("Error fetching board data:", err);
                    setError("Failed to load board.");
                    setLoading(false);
                });
        }
    }, [boardId]);

    const handleAddList = (title: string) => {
        if (!board) return;
        const newListData = { title, board: { id: board.id } };
        apiClient.post<List>('/lists', newListData)
            .then(response => {
                setBoard(prevBoard => {
                    if (!prevBoard) return null;
                    const updatedLists = [...(prevBoard.lists || []), response.data];
                    return { ...prevBoard, lists: updatedLists };
                });
            })
            .catch(err => {
                console.error("Failed to create list:", err);
                setError("Could not create the new list.");
            });
    };

    if (loading) {
        return (
            <Container centerContent>
                <Spinner size="xl" mt="20" />
            </Container>
        );
    }

    if (error) {
        return <Text color="red.500">{error}</Text>;
    }

    return (
        <Container maxW="container.xl" py={10} h="100vh" display="flex" flexDirection="column">
            <Heading mb={6} textAlign="center">
                {board?.name}
            </Heading>
            <Box flex="1" overflow="hidden">
                {board && <KBBoard initialBoard={board} onAddList={handleAddList} />}
            </Box>
        </Container>
    );
}