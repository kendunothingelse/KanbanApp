import React from "react";
import { ThemeProvider, CssBaseline, createTheme } from "@mui/material";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import BoardPage from "./pages/BoardPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import WorkspaceDashboard from "./pages/WorkspaceDashboard";

const theme = createTheme();

const App = () => {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <AuthProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route
                            path="/workspaces"
                            element={
                                <ProtectedRoute>
                                    <WorkspaceDashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/boards/:boardId"
                            element={
                                <ProtectedRoute>
                                    <BoardPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route path="*" element={<Navigate to="/workspaces" replace />} />
                    </Routes>
                </BrowserRouter>
            </AuthProvider>
        </ThemeProvider>
    );
};

export default App;