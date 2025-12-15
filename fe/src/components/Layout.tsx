import React from "react";
import { Box, Flex, Button, Heading } from "@chakra-ui/react";
import { useAuth } from "../auth/AuthContext";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { logout } = useAuth();
    return (
        <Flex direction="column" minH="100vh">
            <Flex as="header" p={4} bg="gray.100" justify="space-between" align="center">
                <Heading size="md">Kanban</Heading>
                <Button onClick={logout} colorScheme="red" variant="outline">
                    Logout
                </Button>
            </Flex>
            <Box p={4} flex="1">
                {children}
            </Box>
        </Flex>
    );
};

export default Layout;