// src/pages/WorkspacePage.tsx
import {
    Box,
    Button,
    Container,
    FormControl,
    FormLabel,
    Heading,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    SimpleGrid,
    useDisclosure
} from "@chakra-ui/react";
import {useContext, useEffect, useState} from "react";
import { Board } from "../api/dummy-data";
import { BoardCard } from "../components/workspace-components/BoardCard";
import apiClient from "../api/api";
import {AuthContext} from "../context/AuthContext";

export default function WorkspacePage() {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [boards, setBoards] = useState<Board[]>([]);
    const [newBoardName, setNewBoardName] = useState("");

    const {user, logout} = useContext(AuthContext)!;

    useEffect(() => {
        // Fetch boards from the API
        apiClient.get<Board[]>('/boards')
            .then(response => {
                setBoards(response.data);
            })
            .catch(error => console.error("Error fetching boards:", error));
    }, []);

    const handleCreateBoard = () => {
        if (newBoardName.trim() === "") return;
        const newBoard = {
            name: newBoardName,
            workspaceId: "ws-1", // This can be dynamic in a real app
        };
        apiClient.post<Board>('/boards', newBoard)
            .then(response => {
                setBoards(prev => [...prev, response.data]);
                setNewBoardName("");
                onClose();
            })
            .catch(error => console.error("Error creating board:", error));
    };

    return (
        <>
            <Container maxW="6xl" py={10}>
                <Heading mb={6} textAlign="center">
                    My Workspace
                </Heading>
                <Box maxW="md" mx="auto" mt="8">
                    <Heading size="md">Welcome, {user?.identifier}</Heading>
                    <Button mt="4" onClick={() => logout()}>Logout</Button>
                </Box>
                <Button onClick={onOpen} mb={6} colorScheme="blue">Create New Board</Button>
                <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
                    {boards.map(board => (
                        <BoardCard key={board.id} board={board} />
                    ))}
                </SimpleGrid>
            </Container>

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Create a new board</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <FormControl>
                            <FormLabel>Board Name</FormLabel>
                            <Input
                                placeholder="e.g., Project Phoenix"
                                value={newBoardName}
                                onChange={(e) => setNewBoardName(e.target.value)}
                            />
                        </FormControl>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onClose}>
                            Cancel
                        </Button>
                        <Button colorScheme="blue" onClick={handleCreateBoard}>
                            Create
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
}