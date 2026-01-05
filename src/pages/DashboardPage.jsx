// src/pages/DashboardPage.jsx
import React, { useState, useCallback } from "react";
import Chat from "../components/Chat";

import "../styles/dashboard.css"; // ✅ добавили

export default function DashboardPage() {
  const [activeSessionId, setActiveSessionId] = useState(null);

  const handleNewSessionCreated = useCallback((newSessionId) => {
    setActiveSessionId(newSessionId);
  }, []);

  const courses = [
    { id: 1, title: "Personal Growth Fundamentals", description: "Build a strong foundation for self-improvement and discipline.", image: "🌱" },
    { id: 2, title: "Effective Communication", description: "Master the art of clear, impactful, and empathetic communication.", image: "💬" },
    { id: 3, title: "Mindfulness for Beginners", description: "Learn to live in the present moment and reduce anxiety.", image: "🧘" },
    { id: 4, title: "Time Management", description: "Stop procrastinating and get more done in less time.", image: "⏳" },
    { id: 5, title: "Financial Literacy", description: "Understand the basics of budgeting and investing.", image: "💰" },
  ];

  return (
    <div className="dash">
      {/* LEFT */}
      <section className="dash__left">
        <header className="dash__header">
          <h2>Available Courses</h2>
          <p>Select a course to view details or start learning.</p>
        </header>

        <div className="dash__grid">
          {courses.map((course) => (
            <article key={course.id} className="course">
              <div className="course__icon">{course.image}</div>
              <h3 className="course__title">{course.title}</h3>
              <p className="course__desc">{course.description}</p>
              <button className="course__btn" type="button">
                Start Course
              </button>
            </article>
          ))}
        </div>
      </section>

      {/* RIGHT */}
      <aside className="dash__right">
        <div className="chatShell">
          <div className="chatShell__header">
            <div className="chatShell__title">AI Assistant</div>
            <div className="chatShell__status">
              <span className="dot" /> Online
            </div>
          </div>

          <div className="chatShell__body">
            <Chat
              activeSessionId={activeSessionId}
              onNewSessionCreated={handleNewSessionCreated}
            />
          </div>
        </div>
      </aside>
    </div>
  );
}
