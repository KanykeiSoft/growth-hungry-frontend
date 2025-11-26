// src/pages/ChatPage.jsx
import React, { useState } from "react";
import { useAuth } from "../auth/useAuth";
import Chat from "../components/Chat.jsx";
import ChatSessionsSidebar from "../components/ChatSessionsSidebar.jsx";

export default function ChatPage() {
  const { logout } = useAuth();
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [refreshSidebar, setRefreshSidebar] = useState(0);

  const handleNewSession = (id) => {
    setActiveSessionId(id);
    setRefreshSidebar((prev) => prev + 1);
  };

  return (
    <div className="chat-page">
      <header className="chat-topbar">
        <h2>AI Chat</h2>
        <button className="gh-btn" onClick={logout}>
          Logout
        </button>
      </header>

      <main>
        <div className="chat-layout">
          <ChatSessionsSidebar
            selectedId={activeSessionId}
            onSelect={setActiveSessionId}
            refreshTrigger={refreshSidebar}
          />

          <div className="chat-main">
            <div className="chat-shell">
              <div className="chat-container">
                <Chat
                  activeSessionId={activeSessionId}
                  onSessionChange={setActiveSessionId}
                  onNewSessionCreated={handleNewSession}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}




