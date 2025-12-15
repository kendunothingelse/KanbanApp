import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Box, Button, Input, Stack, Heading, Text } from "@chakra-ui/react";
import { useAuth } from "../../auth/AuthContext";

const RegisterPage: React.FC = () => {
    const { register } = useAuth();
    const nav = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const onSubmit = async () => {
        await register(username, password);
        nav("/boards");
    };

    return (
        <Box maxW="md" mx="auto" mt={20} p={6} borderWidth="1px" borderRadius="lg">
            <Heading mb={4}>Register</Heading>
            <Stack spacing={3}>
                <Input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
                <Input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                <Button colorScheme="blue" onClick={onSubmit}>Register</Button>
                <Text>
                    Have account? <Link to="/login">Login</Link>
                </Text>
            </Stack>
        </Box>
    );
};

export default RegisterPage;