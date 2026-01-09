// src/App.jsx
import React from "react";
import { Routes, Route, Link, Navigate, useNavigate } from "react-router-dom";

import Register from "./pages/Register.jsx";
import Login from "./pages/Login.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import Home from "./pages/Home.jsx";
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
  const { logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="app-root">
      {/* NAVBAR */}
      <nav style={navStyle}>
        <Link
          to={isAuthenticated ? "/dashboard" : "/"}
          style={{ ...linkStyle, fontSize: "18px", fontWeight: 800 }}
        >
          🌱 Life Assistant
        </Link>

        <div style={linkGroupStyle}>
          {!isAuthenticated ? (
            <>
              <Link to="/login" style={linkStyle}>Login</Link>
              <Link to="/register" style={linkStyle}>Register</Link>
            </>
          ) : (
            <>
              <Link to="/dashboard" style={linkStyle}>Dashboard</Link>
              <button
                onClick={() => {
                  logout();
                  navigate("/login"); // чтобы сразу вернуло на логин
                }}
                style={{ ...btnLikeLink, ...linkStyle, color: "#d9534f" }}
              >
                Logout
              </button>
            </>
          )}
        </div>
      </nav>

      {/* ROUTES */}
      <div className="app-main">
        <Routes>
          {/* Home */}
          <Route
            path="/"
            element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Home />}
          />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
          </Route>

          {/* fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}
