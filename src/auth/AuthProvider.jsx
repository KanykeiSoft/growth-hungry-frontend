import React from "react";
import { useEffect, useMemo, useState } from "react";
import { AuthContext } from "./AuthContext";

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

  useEffect(() => {
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");
  }, [token]);

  useEffect(() => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
  }, [user]);

  const isAuthenticated = Boolean(token);

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
  
    // ВАЖНО: записываем сразу в localStorage
    localStorage.setItem("token", newToken);
  
    setToken(newToken);
  
    if (newUser) {
      localStorage.setItem("user", JSON.stringify(newUser));
      setUser(newUser);
    }
  }
  
  

  function logout() {
    setToken(null);
    setUser(null);
  }

  const value = useMemo(
    () => ({ token, user, isAuthenticated, login, logout, setToken, setUser }),
    [token, user, isAuthenticated]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
