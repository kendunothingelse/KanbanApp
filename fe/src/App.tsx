// src/App.tsx
import React from 'react';
import './App.css';
import {BrowserRouter, Routes, Route} from "react-router-dom";
import KanbanPage from "./pages/KanbanPage";
import WorkspacePage from "./pages/WorkspacePage";
import {ProtectedRoute} from "./ProtectedRoute";
import {Register} from "./pages/Register";
import {Login} from "./pages/Login";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/" element={
                    <ProtectedRoute>
                        <WorkspacePage/>
                    </ ProtectedRoute>
                        } />
                        <Route path="/board/:boardId" element={<KanbanPage/>}/>
                    </Routes>
                    </BrowserRouter>
                    );
                }

                    export default App;
