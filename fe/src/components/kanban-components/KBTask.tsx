// src/components/kanban-components/KBTask.tsx
import { Avatar, AvatarGroup, Badge, Box, Flex, HStack, Spacer, Tag, Text, VStack } from "@chakra-ui/react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card } from "../../api/dummy-data";
import { CalendarIcon, ChatIcon, CheckIcon, DragHandleIcon } from "@chakra-ui/icons";

interface TaskCardProps {
    card: Card;
    onCardClick: (card: Card) => void;
}

export function KBTask({ card, onCardClick }: TaskCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: `card-${card.id}`, // Prefix card ID
        data: {
            type: "Card",
            card,
        },
    });

    const style = {
        transition,
        transform: CSS.Transform.toString(transform),
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 100 : 'auto',
    };

    const checklistProgress = card.checklist
        ? card.checklist.filter((item) => item.completed).length / card.checklist.length
        : 0;

    return (
        <Box
            ref={setNodeRef}
            style={style}
            p={3}
            bg="white"
            borderWidth="1px"
            rounded="md"
            shadow="sm"
        >
            <Flex align="start">
                <VStack align="start" spacing={3} flex="1" onClick={() => onCardClick(card)} cursor="pointer">
                    {card.labels && card.labels.length > 0 && (
                        <Flex wrap="wrap" gap={1}>
                            {card.labels.map(label => (
                                <Badge key={label.id} colorScheme={label.color.split('.')[0]}>{label.name}</Badge>
                            ))}
                        </Flex>
                    )}
                    <Text fontWeight="medium">{card.title}</Text>
                    {card.description && <Text fontSize="sm" color="gray.600" noOfLines={2}>{card.description}</Text>}
                    <Flex width="100%" align="center">
                        <HStack spacing={1}>
                            {card.dueDate && <Tag size="sm"><CalendarIcon mr={1}/> {new Date(card.dueDate).toLocaleDateString()}</Tag>}
                            {card.comments && <Tag size="sm"><ChatIcon mr={1}/> {card.comments.length}</Tag>}
                            {card.checklist && (
                                <Tag size="sm" colorScheme={checklistProgress === 1 ? "green" : "gray"}>
                                    <CheckIcon mr={1}/> {card.checklist.filter(i => i.completed).length}/{card.checklist.length}
                                </Tag>
                            )}
                        </HStack>
                        <Spacer />
                        {card.members && (
                            <AvatarGroup size="sm" max={3}>
                                {card.members.map(member => (
                                    <Avatar key={member.id} name={member.name} src={member.avatarUrl} />
                                ))}
                            </AvatarGroup>
                        )}
                    </Flex>
                </VStack>
                <Box
                    {...attributes}
                    {...listeners}
                    onMouseDown={(e) => e.stopPropagation()}
                    cursor="grab"
                    p={2}
                    ml={2}
                    _hover={{ bg: "gray.200" }}
                    rounded="md"
                >
                    <DragHandleIcon color="gray.500" />
                </Box>
            </Flex>
        </Box>
    );
}
