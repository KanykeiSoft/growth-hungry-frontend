// src/components/ChatSessionsSidebar.jsx
import React, { useEffect, useState } from "react";
import { fetchChatSessions } from "../api/chat";

export default function ChatSessionsSidebar({
  selectedId,
  onSelect,
  refreshTrigger,
}) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");

      try {
        const list = await fetchChatSessions();

        const sorted = [...list].sort(
          (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
        );

        setSessions(sorted);
      } catch (e) {
        console.error(e);
        setError("Не удалось загрузить историю чатов");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [refreshTrigger]);

  // КНОПКА "Новый чат" — просто начинаем пустой диалог
  const handleNewChatClick = () => {
    setError("");
    if (onSelect) onSelect(null); // activeSessionId = null -> Chat начнёт сессии с нуля
  };

  return (
    <aside className="chat-sidebar">
      <h3>История чатов</h3>

      <button
        className="new-chat-btn"
        type="button"
        onClick={handleNewChatClick}
      >
        + Новый чат
      </button>

      {loading && <p>Загрузка…</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && !error && sessions.length === 0 && <p>Нет диалогов</p>}

      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {sessions.map((s) => (
          <li key={s.id} style={{ marginBottom: 4 }}>
            <button
              type="button"
              className={
                "chat-item" + (selectedId === s.id ? " chat-item-active" : "")
              }
              onClick={() => onSelect && onSelect(s.id)}
            >
              <div>{s.title || "Без названия"}</div>
              <div className="chat-time">
                {new Date(s.updatedAt).toLocaleString()}
              </div>
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}

