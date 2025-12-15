import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import LoginPage from "./pages/Auth/LoginPage";
import WorkspacePage from "./pages/WorkspacePage";
import BoardListPage from "./pages/Boards/BoardListPage";
import BoardPage from "./pages/BoardPage";

const Private: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { token } = useAuth();
    return token ? <>{children}</> : <Navigate to="/login" replace />;
};

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/" element={<Private><WorkspacePage /></Private>} />
                    <Route path="/boards" element={<Private><BoardListPage /></Private>} />
                    <Route path="/boards/:id" element={<Private><BoardPage /></Private>} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}