// src/pages/ChatPage.jsx
import React from "react";
import { useAuth } from "../auth/useAuth";
import Chat from "../components/Chat.jsx";

export default function ChatPage() {
  const { logout } = useAuth();

  return (
    <div className="chat-page">
      <header className="chat-topbar">
        <h2>AI Chat</h2>
        <button className="gh-btn" onClick={logout}>Logout</button>
      </header>

      {/* компактная карточка чата */}
      <main className="chat-shell">
        <Chat />
      </main>
    </div>
  );
}


