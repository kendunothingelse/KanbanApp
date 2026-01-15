import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

type AuthContextType = {
    user: { username: string } | null;
    token: string | null;
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEYS = {
    token: "token",
    username:  "username",
};

const persistAuth = (token: string | null, username: string | null) => {
    if (token && username) {
        localStorage.setItem(STORAGE_KEYS. token, token);
        localStorage. setItem(STORAGE_KEYS.username, username);
        return;
    }
    localStorage.removeItem(STORAGE_KEYS. token);
    localStorage.removeItem(STORAGE_KEYS.username);
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [token, setToken] = useState<string | null>(() => localStorage.getItem(STORAGE_KEYS.token));
    const [user, setUser] = useState<{ username: string } | null>(() => {
        const saved = localStorage.getItem(STORAGE_KEYS.username);
        return saved ? { username: saved } : null;
    });

    useEffect(() => {
        persistAuth(token, user?.username ??  null);
    }, [token, user]);

    const login = async (username: string, password: string) => {
        try {
            const res = await api.post("/auth/login", { username, password });
            const newToken = res.data.token as string;
            setToken(newToken);
            setUser({ username });
            persistAuth(newToken, username);
        } catch (error:  any) {
            // Xử lý lỗi login
            if (error.response?. status === 401) {
                throw new Error("Tên đăng nhập hoặc mật khẩu không đúng");
            }
            throw error;
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        persistAuth(null, null);

        // Clear toàn bộ localStorage liên quan đến auth
        localStorage.clear();
    };

    const isAuthenticated = !!token && !!user;

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
};