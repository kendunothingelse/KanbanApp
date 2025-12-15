import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../api";

type AuthContextType = {
    user: { username: string } | null;
    token: string | null;
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));
    const [user, setUser] = useState<{ username: string } | null>(() => {
        const u = localStorage.getItem("username");
        return u ? { username: u } : null;
    });

    useEffect(() => {
        if (token && user) {
            localStorage.setItem("token", token);
            localStorage.setItem("username", user.username);
        }
    }, [token, user]);

    const login = async (username: string, password: string) => {
        const res = await api.post("/auth/login", { username, password });
        const t = res.data.token as string;
        setToken(t);
        setUser({ username });
        localStorage.setItem("token", t);
        localStorage.setItem("username", username);
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem("token");
        localStorage.removeItem("username");
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
};