// src/components/Chat.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchSessionMessages, sendMessage } from "../api/chat";
import { useAuth } from "../auth/useAuth";


export default function Chat({ activeSessionId, onNewSessionCreated }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inputVal, setInputVal] = useState("");
  const [error, setError] = useState("");

  const endRef = useRef(null);
  const shouldAutoScroll = useRef(false);

  const navigate = useNavigate();
  const { logout } = useAuth();

  // автоскролл вниз ТОЛЬКО при отправке
  useEffect(() => {
    if (shouldAutoScroll.current) {
      endRef.current?.scrollIntoView({ behavior: "smooth" });
      shouldAutoScroll.current = false;
    }
  }, [messages]);

  // загрузка истории при выборе сессии
  useEffect(() => {
    shouldAutoScroll.current = false;
    setError("");

    if (!activeSessionId) {
      setMessages([]);
      return;
    }

    let cancelled = false;
    setLoading(true);

    fetchSessionMessages(activeSessionId)
      .then((data) => {
        if (cancelled) return;

        const arr = Array.isArray(data) ? data : data?.messages || [];
        const mapped = arr.map((m, idx) => ({
          id: m.id ?? `${Date.now()}-${idx}`,
          role:
            (m.role || m.sender || "bot").toLowerCase() === "user"
              ? "user"
              : "bot",
          content: m.content ?? m.text ?? "",
        }));

        setMessages(mapped);
      })
      .catch((err) => {
        const status = err?.response?.status;
        if (status === 401) {
          logout?.();
          navigate("/login");
          setError(err?.message || "Please login again");
          return;
        }
        // ✅ важно для теста: показать err.message (например "Network down")
        setError(err?.message || "Chat error. Please try again.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeSessionId, navigate]);

  const handleSend = async (e) => {
    e?.preventDefault?.();

    const text = inputVal.trim();
    if (!text) return;

    setError("");
    shouldAutoScroll.current = true;

    setInputVal("");

    const optimistic = { id: "tmp-" + Date.now(), role: "user", content: text };
    setMessages((prev) => [...prev, optimistic]);

    try {
      const data = await sendMessage(text, activeSessionId);

      const newSid = data?.chatSessionId;
      if (!activeSessionId && newSid) {
        onNewSessionCreated?.(newSid);
      }

      setMessages((prev) => [
        ...prev,
        { id: "bot-" + Date.now(), role: "bot", content: data?.reply ?? "(empty)" },
      ]);
    } catch (err) {
      const status = err?.response?.status;

      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      setInputVal(text);

      if (status === 401) {
        logout?.();
        navigate("/login");
        setError(err?.message || "Please login again");
        return;
      }

      setError(err?.message || "Chat error. Please try again.");
    }
  };

  return (
    <div className="chat-interface">
      <div className="messages-area">
        {!activeSessionId && !loading && messages.length === 0 && (
          <div className="empty-placeholder">
            <h3>Welcome!</h3>
            <p>Start a new conversation by typing below.</p>
          </div>
        )}

        {messages.map((m) => (
          <div
            key={m.id}
            className={`msg-row ${m.role === "user" ? "msg-user" : "msg-ai"}`}
          >
            <div className="msg-bubble">{m.content}</div>
          </div>
        ))}

        {loading && <div className="loading-spinner">Loading chat...</div>}
        <div ref={endRef} />
      </div>

      {error && (
        <div role="alert" style={{ color: "red", marginTop: 8 }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSend} className="input-area">
        <input
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="Type your message..."
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend(e);
            }
          }}
        />

        <button
          className="send-btn"
          type="submit"
          disabled={!inputVal.trim()}
          aria-label="Send"
        >
          ➤
        </button>
      </form>
    </div>
  );
}


