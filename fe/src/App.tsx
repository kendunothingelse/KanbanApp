import React from "react";
import { ChakraProvider } from "@chakra-ui/react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import WorkspaceDashboard from "./pages/WorkspaceDashboard";
import BoardPage from "./pages/BoardPage";

function App() {
    return (
        <ChakraProvider>
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
        </ChakraProvider>
    );
}

export default App;