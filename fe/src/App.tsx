// src/App.tsx
import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import KanbanPage from "./pages/KanbanPage";
import WorkspacePage from "./pages/WorkspacePage";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<WorkspacePage />} />
                <Route path="/board/:boardId" element={<KanbanPage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
