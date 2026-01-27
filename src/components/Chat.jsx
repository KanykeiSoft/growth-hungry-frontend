import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchSectionChat, sendSectionMessage } from "../api/chat";
import { useAuth } from "../auth/useAuth";
import "../styles/chat.css";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function Chat({ sectionId }) {
  const [messages, setMessages] = useState([]);
  const [sessionId, setSessionId] = useState(null);
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

  // 1) при смене sectionId — грузим историю именно этого section
  useEffect(() => {
    shouldAutoScroll.current = false;
    setError("");
    setInputVal("");
    setMessages([]);
    setSessionId(null);

    if (!sectionId) return;

    let cancelled = false;
    setLoading(true);

    fetchSectionChat(sectionId)
      .then((data) => {
        if (cancelled) return;

        // ожидаем: { sessionId, messages: [...] } или { chatSessionId, messages: [...] }
        const sid = data?.sessionId ?? data?.chatSessionId ?? null;
        const arr = Array.isArray(data) ? data : data?.messages || [];

        const mapped = arr.map((m, idx) => ({
          id: m.id ?? `${Date.now()}-${idx}`,
          role: (m.role || m.sender || "bot").toLowerCase() === "user" ? "user" : "bot",
          content: m.content ?? m.text ?? "",
        }));

        setSessionId(sid);
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
        setError(err?.message || "Chat error. Please try again.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [sectionId, navigate, logout]);

  // 2) отправка сообщения в section chat (backend создаст session если её нет)
  const handleSend = async (e) => {
    e?.preventDefault?.();

    const text = inputVal.trim();
    if (!text || !sectionId) return;

    setError("");
    shouldAutoScroll.current = true;
    setInputVal("");

    const optimistic = { id: "tmp-" + Date.now(), role: "user", content: text };
    setMessages((prev) => [...prev, optimistic]);

    try {
      // ожидаем: { sessionId, reply } или { chatSessionId, reply }
      const data = await sendSectionMessage(sectionId, text);

      const newSid = data?.sessionId ?? data?.chatSessionId ?? null;
      if (!sessionId && newSid) setSessionId(newSid);

      setMessages((prev) => [
        ...prev,
        {
          id: "bot-" + Date.now(),
          role: "bot",
          content: data?.reply ?? "(empty)",
        },
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

  const isEmpty = !loading && messages.length === 0;

  return (
    <div className="chat-interface">
      <div className="messages-area">
        {isEmpty && (
          <div className="empty-placeholder">
            <h3>Welcome!</h3>
            <p>Ask a question about this section.</p>
          </div>
        )}

        {messages.map((m) => (
          <div
            key={m.id}
            className={`msg-row ${m.role === "user" ? "msg-user" : "msg-ai"}`}
          >
            <div className="msg-bubble markdown">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {m.content}
              </ReactMarkdown>
            </div>
          </div>
        ))}

        {loading && <div className="loading-spinner">Loading chat...</div>}
        <div ref={endRef} />
      </div>

      {error && (
        <div className="chat-error" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSend} className="input-area">
        <input
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="Type your message..."
          disabled={!sectionId}
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
          disabled={!sectionId || !inputVal.trim()}
          aria-label="Send"
        >
          ➤
        </button>
      </form>
    </div>
  );
}
