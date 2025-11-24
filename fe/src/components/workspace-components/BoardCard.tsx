// src/components/BoardCard.tsx
import { Box, Heading } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { Board } from "../../api/dummy-data";

interface BoardCardProps {
    board: Board;
}

export function BoardCard({ board }: BoardCardProps) {
    return (
        <Link to={`/board/${board.id}`}>
            <Box
                p={5}
                shadow="md"
                borderWidth="1px"
                bg="gray.50"
                _hover={{ shadow: "xl", bg: "gray.100" }}
                rounded="md"
                height="120px"
                display="flex"
                alignItems="center"
                justifyContent="center"
            >
                <Heading fontSize="xl">{board.name}</Heading>
            </Box>
        </Link>
    );
}
