// src/routes/ProtectedRoute.jsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";

export default function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // если пользователь не авторизован — редирект на /login
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          fromProtected: true, // флаг, что редирект с защищённой страницы
          from: location.pathname + location.search + location.hash, // куда хотел попасть
        }}
      />
    );
  }

  // иначе рендерим дочерние защищённые маршруты
  return <Outlet />;
}


