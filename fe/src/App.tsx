import React from "react";
import { ThemeProvider, CssBaseline, createTheme } from "@mui/material";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import BoardPage from "./pages/BoardPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import WorkspaceDashboard from "./pages/WorkspaceDashboard";
import { NotificationProvider } from "./components/NotificationProvider";
import GuidePage from "./pages/GuidePage";

const theme = createTheme({
    palette: {
        primary: { main: "#384B70" },
        secondary: { main: "#507687" },
        warning: { main: "#E6A23C" },
        error: { main: "#B8001F" },
        success: { main: "#507687" },
        info: { main: "#384B70" },
        background: { default: "#FCFAEE", paper: "#ffffff" },
        text: { primary: "#384B70", secondary: "#507687" },
    },
    components: {
        MuiButton: { styleOverrides: { root: { textTransform: "none", borderRadius: 10, fontWeight: 600 } } },
        MuiChip: { styleOverrides: { root: { borderRadius: 8 } } },
        MuiCard: { styleOverrides: { root: { borderRadius: 12, boxShadow: "none" } } },
    },
});

const App = () => (
    <ThemeProvider theme={theme}>
        <CssBaseline />
        <NotificationProvider>
            <AuthProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/workspaces" element={<ProtectedRoute><WorkspaceDashboard /></ProtectedRoute>} />
                        <Route path="/boards/:boardId" element={<ProtectedRoute><BoardPage /></ProtectedRoute>} />
                        <Route path="/guide" element={<ProtectedRoute><GuidePage /></ProtectedRoute>} /> {/* Thêm dòng này */}
                        <Route path="*" element={<Navigate to="/workspaces" replace />} />
                    </Routes>
                </BrowserRouter>
            </AuthProvider>
        </NotificationProvider>
    </ThemeProvider>
);

export default App;