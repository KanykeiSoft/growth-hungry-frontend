// src/routes/ProtectedRoute.jsx
import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

export default function ProtectedRoute({ children = null }) {
  const { isAuthenticated, token } = useAuth();
  const location = useLocation();

  const authed =
    typeof isAuthenticated === "boolean" ? isAuthenticated : Boolean(token);

  if (!authed) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location, fromProtected: true}}
      />
    );
  }

  return children ?? <Outlet />;
}



