import React, { useState, useContext } from "react";
import { Box, Input, Button, FormControl, FormLabel } from "@chakra-ui/react";
import axios from "../api/api";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export const Register: React.FC = () => {
    const [username,setUsername]=useState("");
    const [email,setEmail]=useState("");
    const [password,setPassword]=useState("");
    const navigate = useNavigate();

    const handleSubmit = async () => {
        try {
            await axios.post("/auth/register", { username, email, password });
            // after register you can redirect to login
            navigate("/login");
        } catch (err: any) {
            alert(err?.response?.data || "Registration failed");
        }
    };

    return (
        <Box maxW="md" mx="auto" mt="8">
            <FormControl>
                <FormLabel>Username</FormLabel>
                <Input value={username} onChange={e=>setUsername(e.target.value)}/>
            </FormControl>
            <FormControl mt="4">
                <FormLabel>Email</FormLabel>
                <Input value={email} onChange={e=>setEmail(e.target.value)} />
            </FormControl>
            <FormControl mt="4">
                <FormLabel>Password</FormLabel>
                <Input type="password" value={password} onChange={e=>setPassword(e.target.value)} />
            </FormControl>
            <Button mt="4" onClick={handleSubmit}>Register</Button>
        </Box>
    );
};
