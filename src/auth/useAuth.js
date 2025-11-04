import { useContext } from "react";
import { AuthContext } from "./AuthContext";  // ✅ импорт default

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth должен вызываться внутри <AuthProvider>");
  return ctx;
}
