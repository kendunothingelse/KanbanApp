import React, { useEffect, useState } from "react";
import {
    Button, FormControl, FormLabel, Input, Modal, ModalBody, ModalCloseButton,
    ModalContent, ModalFooter, ModalHeader, ModalOverlay, Select, Stack, Text, Box, VStack, useToast
} from "@chakra-ui/react";
import api from "../api";

type UserSuggestion = { id: number; username: string };

type Props = {
    isOpen: boolean;
    onClose: () => void;
    boardId: number;
    onInvited: () => void;
    defaultRole?: string;
};

const roles = ["ADMIN", "MEMBER", "VIEWER"];

const InviteMemberModal: React.FC<Props> = ({ isOpen, onClose, boardId, onInvited, defaultRole = "MEMBER" }) => {
    const [query, setQuery] = useState("");
    const [selectedUser, setSelectedUser] = useState<UserSuggestion | null>(null);
    const [role, setRole] = useState(defaultRole);
    const [loading, setLoading] = useState(false);
    const [suggestions, setSuggestions] = useState<UserSuggestion[]>([]);
    const toast = useToast();

    useEffect(() => {
        let ignore = false;
        const run = async () => {
            if (!query) { setSuggestions([]); return; }
            try {
                const res = await api.get(`/users/search?prefix=${encodeURIComponent(query)}`);
                if (!ignore) setSuggestions(res.data.slice(0, 4));
            } catch {
                if (!ignore) setSuggestions([]);
            }
        };
        run();
        return () => { ignore = true; };
    }, [query]);

    const invite = async () => {
        if (!boardId || boardId <= 0) {
            toast({ status: "warning", title: "Thiếu boardId hợp lệ" });
            return;
        }
        if (!selectedUser) {
            toast({ status: "warning", title: "Chọn user để mời" });
            return;
        }
        setLoading(true);
        try {
            await api.post("/boards/invite", {
                boardId,
                userId: selectedUser.id,
                role,
            });
            toast({ status: "success", title: "Mời thành viên thành công" });
            onInvited();
            onClose();
            setQuery("");
            setSelectedUser(null);
            setSuggestions([]);
        } catch (e: any) {
            toast({
                status: "error",
                title: "Mời thất bại",
                description: e?.response?.data || e.message,
            });
        } finally {
            setLoading(false);
        }
    };

    const showNoResult = query.length > 0 && suggestions.length === 0;

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Mời thành viên</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Stack spacing="3">
                        <FormControl>
                            <FormLabel>Username (gợi ý tối đa 4)</FormLabel>
                            <Input
                                placeholder="Nhập chữ cái đầu"
                                value={query}
                                onChange={(e) => { setQuery(e.target.value); setSelectedUser(null); }}
                            />
                            {query && (
                                <Box borderWidth="1px" borderRadius="md" mt="2" maxH="150px" overflowY="auto">
                                    <VStack align="stretch" spacing="0">
                                        {suggestions.map(s => (
                                            <Box
                                                key={s.id}
                                                px="3" py="2" _hover={{ bg: "gray.100", cursor: "pointer" }}
                                                onClick={() => { setSelectedUser(s); setQuery(s.username); }}
                                            >
                                                {s.username}
                                            </Box>
                                        ))}
                                        {showNoResult && (
                                            <Text px="3" py="2" color="red.500">Không tìm được tên username tương tự</Text>
                                        )}
                                    </VStack>
                                </Box>
                            )}
                        </FormControl>
                        <FormControl>
                            <FormLabel>Role</FormLabel>
                            <Select value={role} onChange={(e) => setRole(e.target.value)}>
                                {roles.map(r => <option key={r} value={r}>{r}</option>)}
                            </Select>
                        </FormControl>
                    </Stack>
                </ModalBody>
                <ModalFooter>
                    <Button mr={3} onClick={onClose}>Hủy</Button>
                    <Button colorScheme="blue" onClick={invite} isDisabled={!selectedUser} isLoading={loading}>
                        Mời
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default InviteMemberModal;