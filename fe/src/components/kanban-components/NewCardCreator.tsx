// src/components/kanban-components/NewCardCreator.tsx
import { useState } from "react";
import { Box, Button, ButtonGroup, Textarea, VStack } from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";

interface NewCardCreatorProps {
    onAddCard: (title: string) => void;
}

export function NewCardCreator({ onAddCard }: NewCardCreatorProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [cardTitle, setCardTitle] = useState("");

    const handleAddClick = () => {
        if (cardTitle.trim()) {
            onAddCard(cardTitle.trim());
            setCardTitle("");
            setIsEditing(false);
        }
    };

    const handleCancelClick = () => {
        setCardTitle("");
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <VStack align="stretch" spacing={2}>
                <Textarea
                    placeholder="Enter a title for this card..."
                    value={cardTitle}
                    onChange={(e) => setCardTitle(e.target.value)}
                    autoFocus
                />
                <ButtonGroup size="sm">
                    <Button colorScheme="blue" onClick={handleAddClick}>Add card</Button>
                    <Button variant="ghost" onClick={handleCancelClick}>Cancel</Button>
                </ButtonGroup>
            </VStack>
        );
    }

    return (
        <Button
            leftIcon={<AddIcon />}
            variant="ghost"
            justifyContent="flex-start"
            onClick={() => setIsEditing(true)}
            width="100%"
        >
            Add a card
        </Button>
    );
}
