// src/routes/ProtectedRoute.jsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";

/**
 * Защищённый маршрут.
 * - Если пользователь не аутентифицирован — редиректит на /login и запоминает, куда он хотел попасть.
 * - Если аутентифицирован — рендерит дочерний маршрут (<Outlet />) или переданные children.
 *
 * Поддерживаются оба варианта использования:
 *   <Route element={<ProtectedRoute />}>
 *     <Route path="/chat" element={<ChatPage />} />
 *   </Route>
 *
 *   или
 *
 *   <ProtectedRoute>
 *     <ChatPage />
 *   </ProtectedRoute>
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, token } = useAuth();
  const location = useLocation();

  // Фолбэк: если в контексте нет boolean-флага, считаем по наличию токена
  const authed = typeof isAuthenticated === "boolean" ? isAuthenticated : Boolean(token);

  if (!authed) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          fromProtected: true,
          from: location.pathname + location.search + location.hash,
        }}
      />
    );
  }

  // Если компонент используется как обёртка с children — отдаём children, иначе работаем через <Outlet/>
  return children ? children : <Outlet />;
}


