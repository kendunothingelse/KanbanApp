import React, { useState } from "react";
import { Box, Button, Heading, Input, Stack, useToast } from "@chakra-ui/react";
import api from "../api";
import { useNavigate } from "react-router-dom";

const RegisterPage: React.FC = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const toast = useToast();
    const nav = useNavigate();

    const onSubmit = async () => {
        setLoading(true);
        try {
            await api.post("/auth/register", { username, password });
            toast({ status: "success", title: "Đăng ký thành công", description: "Hãy đăng nhập" });
            nav("/login");
        } catch (e: any) {
            toast({ status: "error", title: "Đăng ký thất bại", description: e?.response?.data || e.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box maxW="md" mx="auto" mt="24">
            <Heading mb="6">Đăng ký</Heading>
            <Stack spacing="4">
                <Input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
                <Input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                <Button isLoading={loading} onClick={onSubmit} colorScheme="blue">Đăng ký</Button>
            </Stack>
        </Box>
    );
};

export default RegisterPage;