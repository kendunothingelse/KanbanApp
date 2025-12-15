import React from "react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import Router from "./router";

const App: React.FC = () => (
    <BrowserRouter>
        <AuthProvider>
            <Router />
        </AuthProvider>
    </BrowserRouter>
);

export default App;