import React, { useState } from "react";
import { Box, Button, Typography, Stack, TextField, Link } from "@mui/material";
import api from "../api";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useNotification } from "../components/NotificationProvider";

const RegisterPage: React.FC = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const nav = useNavigate();
    const { notify } = useNotification();

    const onSubmit = async () => {
        setLoading(true);
        try {
            await api.post("/auth/register", { username, password });
            notify("Đăng ký thành công, hãy đăng nhập");
            nav("/login");
        } catch (e: any) {
            notify(e?.response?.data || e.message || "Đăng ký thất bại");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box maxWidth="400px" mx="auto" mt={12}>
            <Typography variant="h4" mb={3}>
                Đăng ký
            </Typography>
            <Stack spacing={2.5}>
                <TextField label="Username" value={username} onChange={(e) => setUsername(e.target.value)} fullWidth />
                <TextField
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    fullWidth
                />
                <Button variant="contained" onClick={onSubmit} disabled={loading}>
                    Đăng ký
                </Button>
            </Stack>
            <Stack direction="row" spacing={1} mt={2}>
                <Typography>Bạn đã có tài khoản?</Typography>
                <Link component={RouterLink} to="/login">
                    Đăng nhập
                </Link>
            </Stack>
        </Box>
    );
};

export default RegisterPage;