import React, { createContext, useContext, useEffect, useState } from "react";
import client from "../api/client";
import { endpoints } from "../api/endpoints";

type AuthContextType = {
    token: string | null;
    login: (u: string, p: string) => Promise<void>;
    register: (u: string, p: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType>({
    token: null,
    login: async () => {},
    register: async () => {},
    logout: () => {},
    isAuthenticated: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [token, setToken] = useState<string | null>(localStorage.getItem("token"));

    const login = async (username: string, password: string) => {
        const res = await client.post(endpoints.auth.login, { username, password });
        localStorage.setItem("token", res.data.token);
        setToken(res.data.token);
    };

    const register = async (username: string, password: string) => {
        const res = await client.post(endpoints.auth.register, { username, password });
        localStorage.setItem("token", res.data.token);
        setToken(res.data.token);
    };

    const logout = () => {
        localStorage.removeItem("token");
        setToken(null);
    };

    const value: AuthContextType = {
        token,
        login,
        register,
        logout,
        isAuthenticated: !!token,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);