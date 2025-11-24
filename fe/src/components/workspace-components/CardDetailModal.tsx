// src/components/workspace-components/CardDetailModal.tsx
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
    VStack,
    Text,
    Flex,
    Tag,
    AvatarGroup,
    Avatar,
    Popover,
    PopoverTrigger,
    PopoverContent,
    PopoverArrow,
    PopoverCloseButton,
    PopoverHeader,
    PopoverBody,
    CheckboxGroup,
    Checkbox,
    Heading,
    Spacer
} from "@chakra-ui/react";
import { Card, Member, Label } from "../../api/dummy-data";
import { AddIcon, CloseIcon } from "@chakra-ui/icons";
import { DueDateSelector } from "../shared/DueDateSelector";
import { LabelManager } from "../shared/LabelManager";
import apiClient from "../../api/api";

interface CardDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    card: Card | null;
    onUpdateCard: (updatedCard: Card) => void;
    allLabels: Label[];
    allMembers: Member[];
    onCreateLabel: (name: string, color: string) => void;
    onUpdateLabel: (label: Label) => void;
}

export function CardDetailModal({ isOpen, onClose, card, onUpdateCard, allLabels, allMembers, onCreateLabel, onUpdateLabel }: CardDetailModalProps) {
    if (!card) return null;

    const handleMemberToggle = (memberId: number) => {
        const isMemberAssigned = card.members?.some(m => m.id === memberId);
        const endpoint = `/cards/${card!.id}/members/${memberId}`;
        const method = isMemberAssigned ? 'delete' : 'post';

        apiClient[method](endpoint).then(response => {
            onUpdateCard(response.data);
        });
    };

    const handleDueDateChange = (date: Date | null) => {
        const updatedCard = { ...card, dueDate: date ? date.toISOString() : undefined };
        apiClient.put(`/cards/${card.id}`, updatedCard).then(response => {
            onUpdateCard(response.data);
        });
    };

    const handleLabelToggle = (labelId: number) => {
        const isLabelAssigned = card.labels?.some(l => l.id === labelId);
        const endpoint = `/cards/${card.id}/labels/${labelId}`;
        const method = isLabelAssigned ? 'delete' : 'post';

        apiClient[method](endpoint).then(response => {
            onUpdateCard(response.data);
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>{card.title}</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack align="start" spacing={6}>
                        <Text>{card.description || "No description provided."}</Text>

                        {/* Members Section */}
                        <Flex align="center" w="100%">
                            <Heading size="sm" minW="100px">Members</Heading>
                            <Spacer />
                            <AvatarGroup size="sm" max={4} mr={2}>
                                {card.members?.map(member => (
                                    <Avatar key={member.id} name={member.name} src={member.avatarUrl} />
                                ))}
                            </AvatarGroup>
                            <Popover>
                                <PopoverTrigger>
                                    <Button size="sm" leftIcon={<AddIcon />}>Members</Button>
                                </PopoverTrigger>
                                <PopoverContent>
                                    <PopoverArrow />
                                    <PopoverCloseButton />
                                    <PopoverHeader>Assign Members</PopoverHeader>
                                    <PopoverBody>
                                        <CheckboxGroup value={card.members?.map(m => String(m.id))}>
                                            <VStack align="start">
                                                {allMembers.map(member => (
                                                    <Checkbox
                                                        key={member.id}
                                                        value={String(member.id)}
                                                        isChecked={card.members?.some(m => m.id === member.id)}
                                                        onChange={() => handleMemberToggle(member.id)}
                                                    >
                                                        {member.name}
                                                    </Checkbox>
                                                ))}
                                            </VStack>
                                        </CheckboxGroup>
                                    </PopoverBody>
                                </PopoverContent>
                            </Popover>
                        </Flex>

                        {/* Labels Section */}
                        <Flex align="center" w="100%">
                            <Heading size="sm" minW="100px">Labels</Heading>
                            <Spacer />
                            <Flex wrap="wrap" gap={2} justifyContent="flex-end" mr={2}>
                                {card.labels?.map(label => (
                                    <Tag key={label.id} colorScheme={label.color.split('.')[0]}>{label.name}</Tag>
                                ))}
                            </Flex>
                            <LabelManager
                                allLabels={allLabels}
                                cardLabels={card.labels || []}
                                onToggleLabel={handleLabelToggle}
                                onCreateLabel={onCreateLabel}
                                onUpdateLabel={onUpdateLabel}
                            />
                        </Flex>

                        {/* Due Date Section */}
                        <Flex align="center" w="100%">
                            <Heading size="sm" minW="100px">Due Date</Heading>
                            <Spacer />
                            <DueDateSelector
                                selectedDate={card.dueDate ? new Date(card.dueDate) : null}
                                onChange={handleDueDateChange}
                            />
                            {card.dueDate && (
                                <Button size="sm" ml={2} onClick={() => handleDueDateChange(null)}>
                                    <CloseIcon />
                                </Button>
                            )}
                        </Flex>

                    </VStack>
                </ModalBody>
                <ModalFooter>
                    <Button variant="ghost" onClick={onClose}>
                        Close
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}