import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import "../styles/dashboard.css";

export default function DashboardPage() {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [startingCourseId, setStartingCourseId] = useState(null);

  // 1️⃣ Загружаем курсы из БД
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setErrorMsg("");

        // 🔹 ОЖИДАЕМ: GET /api/courses
        const res = await api.get("/api/courses");
        const list = Array.isArray(res.data) ? res.data : [];

        if (!alive) return;
        setCourses(list);
      } catch (e) {
        if (!alive) return;
        setErrorMsg(
          e?.response?.data?.message ||
            e?.message ||
            "Failed to load courses"
        );
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  // 2️⃣ Start Course → берём первую секцию с бэка
  const handleStartCourse = async (courseId) => {
    try {
      setStartingCourseId(courseId);
      setErrorMsg("");

      // 🔹 ОЖИДАЕМ: GET /api/courses/{courseId}/sections
      const res = await api.get(`/api/courses/${courseId}/sections`);
      const sections = Array.isArray(res.data) ? res.data : [];

      if (!sections.length) {
        alert("У этого курса пока нет секций");
        return;
      }

      // берём первую секцию (по id)
      const firstSection = [...sections].sort(
        (a, b) => (a.id ?? 0) - (b.id ?? 0)
      )[0];

      if (!firstSection?.id) {
        alert("Не удалось определить первую секцию");
        return;
      }

      navigate(`/courses/${courseId}/sections/${firstSection.id}`);
    } catch (e) {
      setErrorMsg(
        e?.response?.data?.message ||
          e?.message ||
          "Failed to start course"
      );
    } finally {
      setStartingCourseId(null);
    }
  };

  return (
    <div className="dash">
      <section className="dash__left" style={{ width: "100%" }}>
        <header className="dash__header">
          <h2>Available Courses</h2>
          <p>Select a course to view details or start learning.</p>
        </header>

        {loading && <div style={{ padding: 12 }}>Loading...</div>}

        {!loading && errorMsg && (
          <div style={{ padding: 12, color: "crimson" }}>{errorMsg}</div>
        )}

        {!loading && !errorMsg && courses.length === 0 && (
          <div style={{ padding: 12 }}>No courses yet.</div>
        )}

        <div className="dash__grid">
          {courses.map((course) => (
            <article key={course.id} className="course">
              <div className="course__icon">📘</div>

              <h3 className="course__title">{course.title}</h3>
              <p className="course__desc">{course.description || ""}</p>

              <button
                className="course__btn"
                type="button"
                disabled={startingCourseId === course.id}
                onClick={() => handleStartCourse(course.id)}
              >
                {startingCourseId === course.id
                  ? "Starting..."
                  : "Start Course"}
              </button>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
