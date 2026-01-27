import { api } from "./client";

/**
 * OPTIONAL: список всех сессий пользователя (если тебе нужно в будущем)
 * GET /api/chat/sessions
 */
export async function fetchChatSessions() {
  const res = await api.get("/api/chat/sessions");
  return res.data;
}

/**
 * ✅ Главное для таска:
 * Получить чат для конкретного section
 * ОЖИДАЕМ backend:
 * GET /api/chat/sections/:sectionId
 * -> { sessionId: number|null, messages: [] }
 */
export async function fetchSectionChat(sectionId) {
  if (sectionId == null) throw new Error("No sectionId");
  const res = await api.get(`/api/chat/sections/${sectionId}`);
  return res.data;
}

/**
 * ✅ Главное для таска:
 * Отправить сообщение в конкретный section чат
 * Backend должен:
 * - найти/создать session по (userId, sectionId)
 * - сохранить user message
 * - отправить section content + question в LLM
 * - сохранить assistant reply
 *
 * POST /api/chat/sections/:sectionId/messages
 * body: { message: string }
 *
 * -> { sessionId, reply } (или { chatSessionId, reply })
 */
export async function sendSectionMessage(sectionId, message) {
  if (sectionId == null) throw new Error("No sectionId");
  if (!message || !message.trim()) throw new Error("Message is empty");

  const payload = { message: message.trim() };
  const res = await api.post(`/api/chat/sections/${sectionId}/messages`, payload);
  return res.data;
}

/**
 * Старое (session-based) — можешь оставить, если где-то ещё используется.
 * Но для таска оно НЕ обязательно.
 */
export async function fetchSessionMessages(sessionId) {
  if (sessionId == null) throw new Error("No sessionId");
  const res = await api.get(`/api/chat/sessions/${sessionId}/messages`);
  return res.data;
}

export async function sendMessage(message, chatSessionId = null) {
  if (!message || !message.trim()) throw new Error("Message is empty");

  const payload = {
    message: message.trim(),
    ...(chatSessionId != null ? { chatSessionId } : {}),
  };

  const res = await api.post("/api/chat", payload);
  return res.data;
}

export const deleteSession = async (sessionId) => {
  const res = await api.delete(`/api/chat/sessions/${sessionId}`);
  return res.data;
};
