import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/Auth/LoginPage";
import RegisterPage from "./pages/Auth/RegisterPage";
import BoardListPage from "./pages/Boards/BoardListPage";
import BoardDetailPage from "./pages/Boards/BoardDetailPage";
import ProtectedRoute from "./auth/ProtectedRoute";

const Router: React.FC = () => (
    <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
            path="/boards"
            element={
                <ProtectedRoute>
                    <BoardListPage />
                </ProtectedRoute>
            }
        />
        <Route
            path="/boards/:boardId"
            element={
                <ProtectedRoute>
                    <BoardDetailPage />
                </ProtectedRoute>
            }
        />
        <Route path="*" element={<Navigate to="/boards" replace />} />
    </Routes>
);

export default Router;