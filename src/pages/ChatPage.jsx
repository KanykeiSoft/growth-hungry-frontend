// src/pages/ChatPage.jsx
import React, { useCallback, useState } from "react";
import { useAuth } from "../auth/useAuth";
import Chat from "../components/Chat.jsx";
import ChatSessionsSidebar from "../components/ChatSessionsSidebar.jsx";

export default function ChatPage() {
  const { logout } = useAuth();

  const [activeSessionId, setActiveSessionId] = useState(null);
  const [refreshSidebar, setRefreshSidebar] = useState(0);

  // обновить sidebar (перезагрузить список сессий)
  const bumpSidebar = useCallback(() => {
    setRefreshSidebar((prev) => prev + 1);
  }, []);

  // когда пользователь выбирает сессию в sidebar
  const handleSelectSession = useCallback((sessionId) => {
    setActiveSessionId(sessionId);
  }, []);

  // когда Chat создал НОВУЮ сессию (первое сообщение)
  const handleNewSessionCreated = useCallback(
    (newSessionId) => {
      setActiveSessionId(newSessionId);
      bumpSidebar(); // чтобы новая сессия появилась/поднялась в sidebar
    },
    [bumpSidebar]
  );

  // если хочешь обновлять sidebar после каждого сообщения в текущей сессии:
  // const handleSessionUpdated = useCallback(() => bumpSidebar(), [bumpSidebar]);

  return (
    <div className="chat-page">
      <header className="chat-topbar">
        <h2>AI Chat</h2>
        <button className="gh-btn" onClick={logout} type="button">
          Logout
        </button>
      </header>

      <main>
        <div className="chat-layout">
          <ChatSessionsSidebar
            selectedId={activeSessionId}
            onSelect={handleSelectSession}
            refreshTrigger={refreshSidebar}
            onRefresh={bumpSidebar}
          />

          <div className="chat-main">
            <div className="chat-shell">
              <div className="chat-container">
                <Chat
                  activeSessionId={activeSessionId}
                  onSessionChange={handleSelectSession}
                  onNewSessionCreated={handleNewSessionCreated}
                  // onSessionUpdated={handleSessionUpdated} // опционально
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
