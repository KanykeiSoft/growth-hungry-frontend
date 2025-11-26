// src/api/chat.js
import { api } from "./client";   // ← ВАЖНО: фигурные скобки, не default

export async function fetchChatSessions() {
  const res = await api.get("/api/chat/sessions");
  return res.data;
}

export async function fetchSessionMessages(sessionId) {
  const res = await api.get(`/api/chat/sessions/${sessionId}`);
  return res.data;
}
