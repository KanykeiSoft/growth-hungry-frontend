import { useAuth } from "../auth/AuthContext.jsx";

export default function ChatPage() {
  const { logout } = useAuth();
  return (
    <div style={{ padding: 24, fontFamily: "sans-serif" }}>
      <h2>Chat</h2>
      <p>Это защищённая страница. Доступна только авторизованным пользователям.</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
