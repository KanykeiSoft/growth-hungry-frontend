import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          fromProtected: true,
          from: location.pathname + location.search + location.hash, // ⬅️ куда хотел попасть
        }}
      />
    );
  }
  return <Outlet />;
}

