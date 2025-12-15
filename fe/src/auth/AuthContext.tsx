import React, { createContext, useContext, useEffect, useState } from "react";
import api, { setToken } from "../api/api";

type AuthContextType = {
    token?: string;
    login: (u: string, p: string) => Promise<void>;
    register: (u: string, p: string) => Promise<void>;
    logout: () => void;
};
const AuthContext = createContext<AuthContextType>(null!);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [token, setTok] = useState<string | undefined>(localStorage.getItem("token") || undefined);

    useEffect(() => setToken(token), [token]);

    const login = async (u: string, p: string) => {
        const res = await api.post("/auth/login", { username: u, password: p });
        localStorage.setItem("token", res.data.token);
        setTok(res.data.token);
    };

    const register = async (u: string, p: string) => {
        const res = await api.post("/auth/register", { username: u, password: p });
        localStorage.setItem("token", res.data.token);
        setTok(res.data.token);
    };

    const logout = () => {
        localStorage.removeItem("token");
        setTok(undefined);
        setToken();
    };

    return <AuthContext.Provider value={{ token, login, register, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);