import React, { useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import { Box, Button, Heading, Input, Stack, Tabs, TabList, TabPanels, Tab, TabPanel, useToast } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
    const { login, register } = useAuth();
    const [u, setU] = useState("");
    const [p, setP] = useState("");
    const toast = useToast();
    const nav = useNavigate();

    const submit = async (fn: (u: string, p: string) => Promise<void>) => {
        try {
            await fn(u, p);
            nav("/");
        } catch (e: any) {
            toast({ status: "error", title: e?.response?.data || e.message });
        }
    };

    return (
        <Box maxW="md" mx="auto" mt="20">
            <Heading mb="4">Kanban Login / Register</Heading>
            <Tabs>
                <TabList><Tab>Login</Tab><Tab>Register</Tab></TabList>
                <TabPanels>
                    <TabPanel>
                        <Stack>
                            <Input placeholder="username" value={u} onChange={e => setU(e.target.value)} />
                            <Input placeholder="password" type="password" value={p} onChange={e => setP(e.target.value)} />
                            <Button onClick={() => submit(login)}>Login</Button>
                        </Stack>
                    </TabPanel>
                    <TabPanel>
                        <Stack>
                            <Input placeholder="username" value={u} onChange={e => setU(e.target.value)} />
                            <Input placeholder="password" type="password" value={p} onChange={e => setP(e.target.value)} />
                            <Button onClick={() => submit(register)}>Register</Button>
                        </Stack>
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </Box>
    );
}