// src/auth/AuthContext.jsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Храним токен в state + восстанавливаем из localStorage при старте
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  // Синхронизируем token/user с localStorage
  useEffect(() => {
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");
  }, [token]);

  useEffect(() => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
  }, [user]);

  // Флаг авторизации
  const isAuthenticated = Boolean(token);

  // Вход пользователя (после успешного логина)
  function login({ token: newToken, user: newUser }) {
    if (!newToken) throw new Error("Не получен токен авторизации");
    setToken(newToken);
    if (newUser) setUser(newUser);
  }

  // Выход (очищаем все данные)
  function logout() {
    setToken(null);
    setUser(null);
  }

  // Контекстное значение
  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated,
      login,
      logout,
      setToken,
      setUser,
    }),
    [token, user, isAuthenticated]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth должен вызываться внутри <AuthProvider>");
  }
  return ctx;
}
