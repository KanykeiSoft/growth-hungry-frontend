// src/App.jsx
import React from "react";
import { Routes, Route, Link, Navigate } from "react-router-dom";

import Register from "./pages/Register.jsx";
import Login from "./pages/Login.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import { useAuth } from "./auth/useAuth";

// --- стили ---
const navStyle = {
  padding: "12px 20px",
  borderBottom: "1px solid #eee",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  background: "#f3ede6",
};

const linkGroupStyle = {
  display: "flex",
  gap: "16px",
  alignItems: "center",
};

const linkStyle = {
  textDecoration: "none",
  color: "#5b4633",
  fontWeight: 600,
  fontSize: "15px",
};

const btnLikeLink = {
  background: "none",
  border: "none",
  cursor: "pointer",
  padding: 0,
};

export default function App() {
  const { user, logout } = useAuth();

  return (
    <div className="app-root">
      {/* МЕНЮ (всегда показываем) */}
      <nav style={navStyle}>
        <Link
          to={user ? "/dashboard" : "/"}
          style={{ ...linkStyle, fontSize: "18px", fontWeight: 800 }}
        >
          🌱 Life Assistant
        </Link>

        <div style={linkGroupStyle}>
          {!user ? (
            <>
              <Link to="/login" style={linkStyle}>
                Login
              </Link>
              <Link to="/register" style={linkStyle}>
                Register
              </Link>
            </>
          ) : (
            <>
              <Link to="/dashboard" style={linkStyle}>
                Dashboard
              </Link>

              {/* если у тебя будет отдельная страница чата - добавим позже */}
              {/* <Link to="/chat" style={linkStyle}>AI Chat</Link> */}

              <button
                onClick={logout}
                style={{ ...btnLikeLink, ...linkStyle, color: "#d9534f" }}
              >
                Logout
              </button>
            </>
          )}
        </div>
      </nav>

      {/* КОНТЕНТ */}
      <div className="app-main">
        <Routes>
          {/* Home */}
          <Route
            path="/"
            element={
              user ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <div style={{ padding: 40, textAlign: "center" }}>
                  <h1>Welcome to Life Assistant! 🚀</h1>
                  <p>
                    <Link to="/login">Login</Link> to start.
                  </p>
                </div>
              )
            }
          />

          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          {/* Protected */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}
