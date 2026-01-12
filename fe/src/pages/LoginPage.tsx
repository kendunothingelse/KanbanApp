import React, { useState } from "react";
import { Box, Button, Typography, Stack, TextField, Link } from "@mui/material";
import { useAuth } from "../auth/AuthContext";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useNotification } from "../components/NotificationProvider";

const LoginPage: React.FC = () => {
    const { login } = useAuth();
    const nav = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const { notify } = useNotification();

    const onSubmit = async () => {
        setLoading(true);
        try {
            await login(username, password);
            notify("Đăng nhập thành công", "success");
            nav("/workspaces");
        } catch (e: any) {
            notify(e?.response?.data || e.message || "Đăng nhập thất bại", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box maxWidth="400px" mx="auto" mt={12}>
            <Typography variant="h4" mb={3}>
                Đăng nhập
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
                    Login
                </Button>
            </Stack>
            <Stack direction="row" spacing={1} mt={2}>
                <Typography>Bạn chưa có tài khoản?</Typography>
                <Link component={RouterLink} to="/register">
                    Đăng ký
                </Link>
            </Stack>
        </Box>
    );
};

export default LoginPage;