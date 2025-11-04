// src/auth/AuthContext.js
import React from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

// Создаём контекст
export const AuthContext = createContext(null);

// Провайдер для всего приложения
export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  // Синхронизация token с localStorage
  useEffect(() => {
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");
  }, [token]);

  // Синхронизация user с localStorage
  useEffect(() => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
  }, [user]);

  const isAuthenticated = Boolean(token);

  // Вход (принимает объект {token, user} или два параметра)
  function login(arg1, arg2) {
    let newToken, newUser;
    if (typeof arg1 === "object" && arg1 !== null) {
      newToken = arg1.token;
      newUser = arg1.user;
    } else {
      newToken = arg1;
      newUser = arg2;
    }
    if (!newToken) throw new Error("Authorization token not received");
    setToken(newToken);
    if (newUser) setUser(newUser);
  }

  // Выход
  function logout() {
    setToken(null);
    setUser(null);
  }

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

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

// Кастомный хук для доступа к контексту
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within <AuthProvider>");
  }
  return ctx;
}
