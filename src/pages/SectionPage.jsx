import React from "react";
import { useParams } from "react-router-dom";
import Chat from "../components/Chat";
import "../styles/dashboard.css"; // используем те же стили (dash, chatShell и т.д.)

export default function SectionPage() {
  const { courseId, sectionId } = useParams();

  return (
    <div className="dash">
      {/* LEFT: Section content */}
      <section className="dash__left">
        <header className="dash__header">
          <h2>Section</h2>
          <p>
            courseId: <b>{courseId}</b> • sectionId: <b>{sectionId}</b>
          </p>
        </header>

        <div className="course" style={{ marginTop: 16 }}>
          <h3 className="course__title">Section content</h3>
          <p className="course__desc">
            Тут будет текст/видео/код этого section. (Пока заглушка)
          </p>
        </div>
      </section>

      {/* RIGHT: AI Assistant bound to section */}
      <aside className="dash__right">
        <div className="chatShell">
          <div className="chatShell__header">
            <div className="chatShell__title">AI Assistant</div>
            <div className="chatShell__status">
              <span className="dot" /> Online
            </div>
          </div>

          {/* ВАЖНО: передаём sectionId как контекст */}
          <div className="chatShell__body">
            <Chat sectionId={sectionId} courseId={courseId} />
          </div>
        </div>
      </aside>
    </div>
  );
}
