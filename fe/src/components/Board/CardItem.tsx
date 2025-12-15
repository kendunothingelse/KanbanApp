import React from "react";
import { Box, Text } from "@chakra-ui/react";
import { Card } from "../../types";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type Props = { card: Card };

const CardItem: React.FC<Props> = ({ card }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: `card-${card.id}`,
        data: card,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.7 : 1,
    };

    return (
        <Box
            ref={setNodeRef}
            {...attributes}
            {...listeners}
            p={3}
            bg="white"
            borderWidth="1px"
            borderRadius="md"
            boxShadow="sm"
            style={style}
            cursor="grab"
        >
            <Text fontWeight="semibold">{card.title}</Text>
            {card.description && <Text fontSize="sm" color="gray.600">{card.description}</Text>}
        </Box>
    );
};

export default CardItem;