// src/components/ChatSessionsSidebar.jsx
import React, { useEffect, useMemo, useState } from "react";
import { fetchChatSessions } from "../api/chat";

export default function ChatSessionsSidebar({
  selectedId,
  onSelect,
  refreshTrigger,
  onRefresh,
}) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  const selectedKey = useMemo(
    () => (selectedId == null ? null : String(selectedId)),
    [selectedId]
  );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const list = await fetchChatSessions();
        const arr = Array.isArray(list) ? list : [];

        const toTime = (v) => {
          const t = v ? new Date(v).getTime() : 0;
          return Number.isFinite(t) ? t : 0;
        };

        const sorted = [...arr].sort(
          (a, b) => toTime(b.updatedAt) - toTime(a.updatedAt)
        );

        if (!cancelled) setSessions(sorted);
      } catch (e) {
        console.error(e);
        // если 401 — значит просто не залогинен/токен нет/просрочен
        const status = e?.response?.status;
        if (!cancelled) {
          if (status === 401) {
            setSessions([]);
            setError(""); // можно не показывать ошибку
          } else {
            setError("Не удалось загрузить историю чатов");
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [refreshTrigger]);

  const handleNewChatClick = () => {
    setError("");
    onSelect?.(null);
  };

  const handleRetry = () => {
    setError("");
    onRefresh?.();
  };

  const formatTime = (v) => {
    if (!v) return "—";
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleString();
  };

  return (
    <aside className="chat-sidebar">
      <h3>История чатов</h3>

      <button
        className="new-chat-btn"
        type="button"
        onClick={handleNewChatClick}
        disabled={loading}
      >
        + Новый чат
      </button>

      {loading && <p>Загрузка…</p>}

      {!loading && error && (
        <div>
          <p style={{ color: "red" }}>{error}</p>
          <button type="button" onClick={handleRetry}>
            Повторить
          </button>
        </div>
      )}

      {!loading && !error && sessions.length === 0 && <p>Нет диалогов</p>}

      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {sessions.map((s) => {
          const isActive = selectedKey != null && String(s.id) === selectedKey;

          return (
            <li key={s.id} style={{ marginBottom: 4 }}>
              <button
                type="button"
                className={"chat-item" + (isActive ? " chat-item-active" : "")}
                onClick={() => onSelect?.(s.id)}
              >
                <div>{s.title || "Без названия"}</div>
                <div className="chat-time">{formatTime(s.updatedAt)}</div>
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
