import React, { useState, useContext } from "react";
import { Box, Input, Button, FormControl, FormLabel } from "@chakra-ui/react";
import axios from "../api/api";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export const Login: React.FC = () => {
    const [identifier,setIdentifier]=useState("");
    const [password,setPassword]=useState("");
    const { setUser } = React.useContext(AuthContext)!;
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            const res = await axios.post("/auth/login", { identifier, password });
            const token = res.data.token;
            localStorage.setItem("token", token);
            setUser({identifier: res.data.identifier });
            navigate("/"); // redirect to profile
        } catch (err: any) {
            alert(err?.response?.data || "Login failed");
        }
    };

    return (
        <Box maxW="md" mx="auto" mt="8">
        <FormControl>
            <FormLabel>Username</FormLabel>
        <Input value={identifier} onChange={e=>setIdentifier(e.target.value)} />
    </FormControl>
    <FormControl mt="4">
        <FormLabel>Password</FormLabel>
        <Input type="password" value={password} onChange={e=>setPassword(e.target.value)} />
    </FormControl>
    <Button mt="4" onClick={handleLogin}>Login</Button>
        </Box>
);
};
