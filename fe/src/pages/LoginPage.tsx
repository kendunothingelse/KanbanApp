import React, {useState} from "react";
import {Box, Button, Heading, Input, Stack, Text, useToast} from "@chakra-ui/react";
import {useAuth} from "../auth/AuthContext";
import {useNavigate} from "react-router-dom";
import {Link as RouterLink} from "react-router-dom";
import {Link, HStack} from "@chakra-ui/react";

const LoginPage: React.FC = () => {
    const {login} = useAuth();
    const toast = useToast();
    const nav = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const onSubmit = async () => {
        setLoading(true);
        try {
            await login(username, password);
            nav("/workspaces"); // điều hướng dashboard workspace
        } catch (e: any) {
            toast({status: "error", title: "Đăng nhập thất bại", description: e?.response?.data || e.message});
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box maxW="md" mx="auto" mt="24">
            <Heading mb="6">Đăng nhập</Heading>
            <Stack spacing="4">
                <Input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)}/>
                <Input placeholder="Password" type="password" value={password}
                       onChange={(e) => setPassword(e.target.value)}/>
                <Button isLoading={loading} onClick={onSubmit} colorScheme="blue">Login</Button>
            </Stack>
            <HStack>
                <Text>Bạn chưa có tài khoản?</Text>
                <Link as={RouterLink} to="/register" color="blue.500">
                    Đăng ký
                </Link>
            </HStack>
        </Box>
    );
};

export default LoginPage;