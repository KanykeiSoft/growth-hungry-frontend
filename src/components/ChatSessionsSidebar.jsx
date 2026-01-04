// src/components/ChatSessionsSidebar.jsx
import React, { useEffect, useMemo, useState } from "react";
// Import your API functions
import { fetchChatSessions, deleteSession } from "../api/chat";

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

  // --- DELETE HANDLER ---
  const handleDelete = async (e, sessionId) => {
    // 1. Stop the click from bubbling up (prevents opening the chat)
    e.stopPropagation(); 
    
    // 2. Confirm in English
    if (window.confirm("Are you sure you want to delete this chat?")) {
      try {
        await deleteSession(sessionId);
        
        // 3. Update UI immediately
        setSessions(prev => prev.filter(s => s.id !== sessionId));
        
        // 4. If the deleted chat was open, close it
        if (selectedId === sessionId) {
          onSelect?.(null);
        }
      } catch (err) {
        console.error("Delete failed:", err);
        alert("Failed to delete chat.");
      }
    }
  };

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
        
        // Sort by newest first
        const sorted = [...arr].sort(
          (a, b) => toTime(b.updatedAt) - toTime(a.updatedAt)
        );
        
        if (!cancelled) setSessions(sorted);
      } catch (e) {
        console.error(e);
        const status = e?.response?.status;
        if (!cancelled) {
          if (status === 401) {
            setSessions([]);
          } else {
            setError("Failed to load chat history");
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
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
      <h3>Chat History</h3>

      <button
        className="new-chat-btn"
        type="button"
        onClick={handleNewChatClick}
        disabled={loading}
      >
        + New Chat
      </button>

      {loading && <p>Loading…</p>}

      {!loading && error && (
        <div>
          <p style={{ color: "red" }}>{error}</p>
          <button type="button" onClick={handleRetry}>Retry</button>
        </div>
      )}

      {!loading && !error && sessions.length === 0 && <p>No conversations</p>}

      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {sessions.map((s) => {
          const isActive = selectedKey != null && String(s.id) === selectedKey;

          return (
            <li 
              key={s.id} 
              // 'position: relative' is needed for the delete button absolute positioning
              style={{ marginBottom: 4, position: 'relative', display: 'flex', alignItems: 'center' }}
            >
              <button
                type="button"
                className={"chat-item" + (isActive ? " chat-item-active" : "")}
                onClick={() => onSelect?.(s.id)}
                style={{ flex: 1, textAlign: 'left' }}
              >
                <div>{s.title || "Untitled"}</div>
                <div className="chat-time">{formatTime(s.updatedAt)}</div>
              </button>

              {/* DELETE BUTTON */}
              {/* Uses 'delete-btn' class so your CSS handles the hover/opacity */}
              <button
                type="button"
                className="delete-btn"
                onClick={(e) => handleDelete(e, s.id)}
                title="Delete chat"
              >
                &times; 
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}