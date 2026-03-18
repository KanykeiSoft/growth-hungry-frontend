import React from "react";
import {
  Routes,
  Route,
  Link,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";

import Register from "./pages/Register.jsx";
import Login from "./pages/Login.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import Home from "./pages/Home.jsx";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import { useAuth } from "./auth/useAuth";
import CoursesPage from "./pages/CoursesPage.jsx";
import CoursePage from "./pages/CoursePage.jsx";
import SectionPage from "./pages/SectionPage.jsx";

const navStyle = {
  position: "sticky",
  top: 0,
  zIndex: 50,
  padding: "14px 24px",
  borderBottom: "1px solid rgba(229, 231, 235, 0.8)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "rgba(255,255,255,0.88)",
  backdropFilter: "blur(10px)",
};

const navInnerStyle = {
  width: "100%",
  maxWidth: "1240px",
  margin: "0 auto",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const emptyLeftStyle = {
  width: "120px",
};

const linkGroupStyle = {
  display: "flex",
  gap: "18px",
  alignItems: "center",
};

const linkStyle = {
  textDecoration: "none",
  color: "#1f2937",
  fontWeight: 600,
  fontSize: "15px",
};

const primaryLinkStyle = {
  textDecoration: "none",
  color: "#FFFFFF",
  background: "linear-gradient(135deg, #2563EB, #1D4ED8)",
  padding: "10px 18px",
  borderRadius: "14px",
  fontWeight: 700,
  fontSize: "15px",
  boxShadow: "0 10px 22px rgba(37, 99, 235, 0.18)",
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
  const location = useLocation();

  const hideTopNav =
    location.pathname.startsWith("/courses") ||
    location.pathname.startsWith("/sections");

  return (
    <div className="app-root">
      {!hideTopNav && (
        <nav style={navStyle}>
          <div style={navInnerStyle}>
            <div style={emptyLeftStyle} />

            <div style={linkGroupStyle}>
              {!isAuthenticated ? (
                <Link to="/login" style={primaryLinkStyle}>
                  Sign In
                </Link>
              ) : (
                <>
                  <Link to="/dashboard" style={linkStyle}>
                    Dashboard
                  </Link>

                  <button
                    onClick={() => {
                      logout();
                      navigate("/login");
                    }}
                    style={{ ...btnLikeLink, ...linkStyle, color: "#DC2626" }}
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </nav>
      )}

      <div className="app-main">
        <Routes>
          <Route
            path="/"
            element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Home />}
          />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/courses/:courseId" element={<CoursePage />} />
            <Route
              path="/courses/:courseId/sections/:sectionId"
              element={<SectionPage />}
            />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}