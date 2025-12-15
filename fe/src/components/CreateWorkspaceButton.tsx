import React, { useState } from "react";
import { Button, useToast, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Stack } from "@chakra-ui/react";
import api from "../api";

const CreateWorkspaceButton: React.FC<{ onCreated: () => void }> = ({ onCreated }) => {
    const [isOpen, setOpen] = useState(false);
    const [name, setName] = useState("");
    const toast = useToast();
    const [loading, setLoading] = useState(false);

    const createWs = async () => {
        if (!name) return;
        setLoading(true);
        try {
            await api.post("/workspaces", { name });
            toast({ status: "success", title: "Đã tạo workspace" });
            onCreated();
            setOpen(false);
            setName("");
        } catch (e: any) {
            toast({ status: "error", title: "Lỗi", description: e?.response?.data || e.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Button onClick={() => setOpen(true)}>Tạo workspace</Button>
            <Modal isOpen={isOpen} onClose={() => setOpen(false)}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Tạo workspace</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Stack>
                            <Input placeholder="Tên workspace" value={name} onChange={(e) => setName(e.target.value)} />
                        </Stack>
                    </ModalBody>
                    <ModalFooter>
                        <Button mr={3} onClick={() => setOpen(false)}>Hủy</Button>
                        <Button colorScheme="blue" onClick={createWs} isLoading={loading}>Tạo</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

export default CreateWorkspaceButton;