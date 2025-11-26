// src/components/Chat.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { api } from "../api/client";
import { fetchSessionMessages } from "../api/chat";

// helper: message with unique id
function mkMsg(sender, text) {
  return {
    id: crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`,
    sender, // "user" | "bot" | "system"
    text,
    ts: Date.now(),
  };
}

/**
 * Reusable Chat UI
 * Props:
 * - initialMessages?: Array<{ id?: string, sender: "bot" | "user" | "system", text: string }>
 * - onSend?: (text: string) => Promise<{ reply?: string }>
 * - activeSessionId?: number | null
 */
export default function Chat({
  initialMessages = [],
  onSend,
  activeSessionId,
  onSessionChange,
  onNewSessionCreated,
}) {
  const { logout } = useAuth?.() ?? {};
  const navigate = useNavigate();

  // история сообщений
  const [messages, setMessages] = useState(
    (initialMessages.length
      ? initialMessages
      : [mkMsg("bot", "Hi, ask me")]
    ).map((m) => (m?.id ? m : mkMsg(m.sender, m.text)))
  );
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // автоскролл вниз
  const endRef = useRef(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // --------- Загружаем сообщения при смене activeSessionId ---------
  useEffect(() => {
    // если сессия не выбрана (новый чат) — показываем дефолтное приветствие
    if (!activeSessionId) {
      setMessages(
        (initialMessages.length
          ? initialMessages
          : [mkMsg("bot", "Hi, ask me")]
        ).map((m) => (m?.id ? m : mkMsg(m.sender, m.text)))
      );
      return;
    }

    async function loadSession() {
      setLoading(true);
      setError("");
      try {
        const history = await fetchSessionMessages(activeSessionId);

        // history: или массив, или объект с messages — подстраиваемся
        const raw = Array.isArray(history)
          ? history
          : Array.isArray(history?.messages)
          ? history.messages
          : [];

        const mapped = raw.map((m) => ({
          ...m,
          id: m.id || crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`,
          sender:
            m.sender ||
            (m.role === "USER" || m.role === "user" ? "user" : "bot"),
          text: m.content || m.text || "",
        }));

        setMessages(mapped);
      } catch (e) {
        console.error(e);
        setError("Failed to load conversation history");
      } finally {
        setLoading(false);
      }
    }

    loadSession();
  }, [activeSessionId]); // ВАЖНО: только activeSessionId, без initialMessages

  // --------- дефолтная отправка на /api/chat (JWT добавит интерсептор) ---------
  const defaultOnSend = async (msg) => {
    try {
      const payload = {
        message: msg,
        // если есть активная сессия — отправляем её id
        ...(activeSessionId != null ? { chatSessionId: activeSessionId } : {}),
      };

      const { data } = await api.post("/api/chat", payload);

      // читаем id сессии из ответа бэка (ChatResponse.chatSessionId)
      const newSessionId = data?.chatSessionId;

      // если бэк создал новую сессию — сообщаем наверх
      if (newSessionId && !activeSessionId) {
        onNewSessionCreated?.(newSessionId);
        onSessionChange?.(newSessionId);
      }

      return { reply: data?.reply ?? "(empty response)" };
    } catch (e) {
      const status = e?.response?.status;
      if (status === 401) {
        logout?.();
        navigate("/login");
        throw new Error("401 Unauthorized. Пожалуйста, войдите заново.");
      }
      const body = e?.response?.data ?? e.message ?? "запрос отклонён";
      throw new Error(`Ошибка${status ? " " + status : ""}: ${String(body)}`);
    }
  };

  // --------- обработчик отправки сообщения ---------
  async function handleSend() {
    const msg = text.trim();
    if (!msg || loading) return;

    setError("");
    setText("");
    setMessages((prev) => [...prev, mkMsg("user", msg)]);
    setLoading(true);

    try {
      const handler = onSend || defaultOnSend;
      const res = await handler(msg);
      const reply = res?.reply ?? "(no reply)";
      setMessages((prev) => [...prev, mkMsg("bot", reply)]);
    } catch (e) {
      setError(e?.message || "Failed to send message");
      // отдельный системный пузырь, чтобы тесты ловили именно его
      setMessages((prev) => [
        ...prev,
        mkMsg("system", "Chat error. Please try again later."),
      ]);
    } finally {
      setLoading(false);
    }
  }

  // Enter = send; Shift+Enter = newline
  function onKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="chat-container">
      <header className="chat-header">
        <h2>AI Chat</h2>
      </header>

      <main className="chat-window" aria-live="polite">
        {messages.map((m) => (
          <div key={m.id} className={`msg ${m.sender}`}>
            <div
              className="bubble"
              // помечаем только системный пузырь ошибки
              {...(m.sender === "system" && m.text.startsWith("Chat error")
                ? { "data-testid": "error-bubble", role: "status" }
                : {})}
            >
              {m.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="msg bot">
            <div className="bubble">Typing...</div>
          </div>
        )}

        {error && <div className="error">{error}</div>}
        <div ref={endRef} />
      </main>

      <footer className="chat-input-area">
        <textarea
          className="chat-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Write message…"
          rows={1}
          disabled={loading}
          aria-label="message…"
        />
        <button
          className="send-btn"
          onClick={handleSend}
          disabled={loading || !text.trim()}
          aria-label="Send"
        >
          {loading ? "Sending…" : "Send"}
        </button>
      </footer>
    </div>
  );
}



