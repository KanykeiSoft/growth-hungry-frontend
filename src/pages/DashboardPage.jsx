import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/dashboard.css";

export default function DashboardPage() {
  const navigate = useNavigate();

  const courses = [
    { id: 1, title: "Personal Growth Fundamentals", description: "Build a strong foundation for self-improvement and discipline.", image: "🌱" },
    { id: 2, title: "Effective Communication", description: "Master the art of clear, impactful, and empathetic communication.", image: "💬" },
    { id: 3, title: "Mindfulness for Beginners", description: "Learn to live in the present moment and reduce anxiety.", image: "🧘" },
    { id: 4, title: "Time Management", description: "Stop procrastinating and get more done in less time.", image: "⏳" },
    { id: 5, title: "Financial Literacy", description: "Understand the basics of budgeting and investing.", image: "💰" },
  ];

  const handleStartCourse = (courseId) => {
    // Минимально: отправляем на "первую секцию" курса.
    // Потом можно заменить на реальный firstSectionId из API.
    const firstSectionId = 1;

    navigate(`/courses/${courseId}/sections/${firstSectionId}`);
  };

  return (
    <div className="dash">
      {/* LEFT (сделаем единственной колонкой) */}
      <section className="dash__left" style={{ width: "100%" }}>
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

              <button
                className="course__btn"
                type="button"
                onClick={() => handleStartCourse(course.id)}
              >
                Start Course
              </button>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
