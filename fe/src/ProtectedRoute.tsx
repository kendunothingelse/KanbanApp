import React from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";

export const ProtectedRoute: React.FC<{children: React.ReactElement}> = ({ children }) => {
    const ctx = React.useContext(AuthContext);
    if (!ctx) return <Navigate to="/login" replace />;

    const { user } = ctx;
    // if user is null -> not logged in -> redirect to /login
    if (!user) return <Navigate to="/login" replace />;

    return children;
};
