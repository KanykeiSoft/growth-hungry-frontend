// src/api/chat.js
import { api } from "./client";


// список сессий
export async function fetchChatSessions() {
  const res = await api.get("/api/chat/sessions");
  return res.data;
}

// сообщения конкретной сессии
export async function fetchSessionMessages(sessionId) {
  if (sessionId == null) throw new Error("No sessionId");
  const res = await api.get(`/api/chat/sessions/${sessionId}/messages`);
  return res.data;
}

// отправка сообщения (создаст сессию если chatSessionId не передан)
export async function sendMessage(message, chatSessionId = null) {
  if (!message || !message.trim()) throw new Error("Message is empty");

  const payload = {
    message: message.trim(),
    ...(chatSessionId != null ? { chatSessionId } : {}),
  };

  const res = await api.post("/api/chat", payload);
  return res.data; // ожидаем { reply, chatSessionId, ... }
}
