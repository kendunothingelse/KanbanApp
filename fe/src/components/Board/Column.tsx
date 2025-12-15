import React from "react";
import { Box, Heading, Stack } from "@chakra-ui/react";
import { Column as ColumnType, Card as CardType } from "../../types";
import CardItem from "./CardItem";
import { useDroppable } from "@dnd-kit/core";

type Props = {
    column: ColumnType;
    cards: CardType[];
};

const Column: React.FC<Props> = ({ column, cards }) => {
    const { setNodeRef, isOver } = useDroppable({
        id: `column-${column.id}`,
        data: column,
    });

    return (
        <Box ref={setNodeRef} bg="gray.50" p={3} borderRadius="lg" minW="250px" borderWidth="1px">
            <Heading size="sm" mb={2}>{column.name}</Heading>
            <Stack spacing={3} opacity={isOver ? 0.9 : 1}>
                {cards.map((c) => (
                    <CardItem key={c.id} card={c} />
                ))}
            </Stack>
        </Box>
    );
};

export default Column;