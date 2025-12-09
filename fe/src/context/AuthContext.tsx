import React, { createContext, useState, useEffect } from "react";
import apiClient from "../api/api";

type User = { identifier: string } | null;
type AuthContextType = {
    user: User;
    setUser: (u: User) => void;
    logout: () => void;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
    const [user, setUser] = useState<User>(null);

    // on mount, try to fetch /auth/me to validate token and get user
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;
        apiClient.get("/auth/me")
            .then(res => {
                setUser({ identifier: res.data.identifier});
            })
            .catch(() => {
                localStorage.removeItem("token");
                setUser(null);
            });
    }, []);

    function logout() {
        localStorage.removeItem("token");
        setUser(null);
    }

    return <AuthContext.Provider value={{ user, setUser, logout }}>{children}</AuthContext.Provider>;
};
