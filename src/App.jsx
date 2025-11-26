// src/App.jsx
import React from "react";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import Register from "./pages/Register.jsx";
import Login from "./pages/Login.jsx";
import ChatPage from "./pages/ChatPage.jsx";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";

const navStyle = {
  padding: "12px 20px",
  borderBottom: "1px solid #eee",
  display: "flex",
  gap: "16px",              // <-- расстояние между ссылками
  background: "#f3ede6",
};

const linkStyle = {
  textDecoration: "none",
  color: "#5b4633",
  fontWeight: 500,
  fontSize: "14px",
};

export default function App() {
  return (
    <div className="app-root">
      {/* Верхнее меню */}
      <nav style={navStyle}>
        <Link to="/" style={linkStyle}>
          Home
        </Link>
        <Link to="/register" style={linkStyle}>
          Register
        </Link>
        <Link to="/login" style={linkStyle}>
          Login
        </Link>
      </nav>

      {/* Страницы */}
      <div className="app-main">
        <Routes>
          <Route path="/" element={<div style={{ padding: 12 }}>Home</div>} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/chat" element={<ChatPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}





