// src/components/kanban-components/NewListCreator.tsx
import { useState } from "react";
import { Box, Button, ButtonGroup, Input, VStack } from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";

interface NewListCreatorProps {
    onAddList: (title: string) => void;
}

export function NewListCreator({ onAddList }: NewListCreatorProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [listTitle, setListTitle] = useState("");

    const handleAddClick = () => {
        if (listTitle.trim()) {
            onAddList(listTitle.trim());
            setListTitle("");
            setIsEditing(false);
        }
    };

    const handleCancelClick = () => {
        setListTitle("");
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <VStack spacing={2} w="300px" bg="gray.200" p={3} rounded="lg">
                <Input
                    placeholder="Enter list title..."
                    value={listTitle}
                    onChange={(e) => setListTitle(e.target.value)}
                    autoFocus
                    bg="white"
                />
                <ButtonGroup size="sm">
                    <Button colorScheme="blue" onClick={handleAddClick}>Add List</Button>
                    <Button variant="ghost" onClick={handleCancelClick}>Cancel</Button>
                </ButtonGroup>
            </VStack>
        );
    }

    return (
        <Button
            leftIcon={<AddIcon />}
            onClick={() => setIsEditing(true)}
            w="300px"
            justifyContent="flex-start"
            variant="ghost"
            bg="blackAlpha.200"
            _hover={{ bg: "blackAlpha.300" }}
        >
            Add another list
        </Button>
    );
}