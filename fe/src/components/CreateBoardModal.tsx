import React, { useEffect, useState } from "react";
import {
    Button, FormControl, FormLabel, Input, Modal, ModalBody, ModalCloseButton,
    ModalContent, ModalFooter, ModalHeader, ModalOverlay, Stack, Select, useToast, Box, VStack, Text
} from "@chakra-ui/react";
import api from "../api";

type Props = {
    isOpen: boolean;
    onClose: () => void;
    workspaceId: number;
    onCreated: () => void;
};

const roles = ["ADMIN", "MEMBER", "VIEWER"];
type UserSuggestion = { id: number; username: string };

const CreateBoardModal: React.FC<Props> = ({ isOpen, onClose, workspaceId, onCreated }) => {
    const [name, setName] = useState("");
    const [role, setRole] = useState<string>("MEMBER");
    const toast = useToast();
    const [loading, setLoading] = useState(false);

    const [query, setQuery] = useState("");
    const [selectedUser, setSelectedUser] = useState<UserSuggestion | null>(null);
    const [suggestions, setSuggestions] = useState<UserSuggestion[]>([]);

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

    const createBoard = async () => {
        if (workspaceId < 0) {
            toast({ status: "warning", title: "Chưa có workspace", description: "Hãy tạo/chọn workspace trước." });
            return;
        }
        if (!name) {
            toast({ status: "warning", title: "Vui lòng nhập tên board" });
            return;
        }
        setLoading(true);
        try {
            const res = await api.post("/boards", { name, workspaceId });
            const boardId = res.data.id;
            if (selectedUser) {
                await api.post("/boards/invite", { boardId, userId: selectedUser.id, role });
            }
            toast({ status: "success", title: "Tạo board thành công" });
            onCreated();  // reload board list
            onClose();
            setName("");
            setQuery("");
            setSelectedUser(null);
            setSuggestions([]);
        } catch (e: any) {
            toast({ status: "error", title: "Lỗi", description: e?.response?.data || e.message });
        } finally {
            setLoading(false);
        }
    };

    const showNoResult = query.length > 0 && suggestions.length === 0;

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Tạo board mới</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Stack spacing="3">
                        <FormControl isRequired>
                            <FormLabel>Tên board</FormLabel>
                            <Input value={name} onChange={(e) => setName(e.target.value)} />
                        </FormControl>
                        <FormControl>
                            <FormLabel>Thêm thành viên (tùy chọn, gõ để gợi ý)</FormLabel>
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
                        {selectedUser && (
                            <FormControl>
                                <FormLabel>Role</FormLabel>
                                <Select value={role} onChange={(e) => setRole(e.target.value)}>
                                    {roles.map(r => <option key={r} value={r}>{r}</option>)}
                                </Select>
                            </FormControl>
                        )}
                    </Stack>
                </ModalBody>
                <ModalFooter>
                    <Button mr={3} onClick={onClose} variant="ghost">Hủy</Button>
                    <Button colorScheme="blue" onClick={createBoard} isLoading={loading}>Tạo</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default CreateBoardModal;