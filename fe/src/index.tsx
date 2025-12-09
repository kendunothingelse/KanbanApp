import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import {ChakraProvider} from "@chakra-ui/react";
import {AuthProvider} from "./context/AuthContext";

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);
root.render(
    <React.StrictMode>
        <ChakraProvider>
            <AuthProvider>
                <App/>
            </AuthProvider>
        </ChakraProvider>
    </React.StrictMode>
);

