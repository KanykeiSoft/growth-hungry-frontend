import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api/client";

export default function CourseSectionsPage() {
  // берем courseId из URL
  const { courseId } = useParams();

  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        // ADDED: запрос к backend за секциями курса
        const res = await api.get(`/api/courses/${courseId}/sections`);

        if (!alive) return;

        // ADDED: сохраняем массив секций
        setSections(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error("Failed to load sections:", error);

        if (!alive) return;

        setSections([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [courseId]);

  // ADDED: состояние загрузки
  if (loading) {
    return (
      <div style={{ padding: 24, color: "#6B7280" }}>
        Loading sections...
      </div>
    );
  }

  return (
    <div
      style={{
        padding: 24,
        minHeight: "100vh",
        background: "#F8FAFC",
      }}
    >
      <div
        style={{
          maxWidth: 900,
          margin: "0 auto",
          background: "#FFFFFF",
          border: "1px solid #E5E7EB",
          borderRadius: 16,
          padding: 24,
          boxShadow: "0 6px 20px rgba(0,0,0,0.04)",
        }}
      >
        <h2
          style={{
            marginTop: 0,
            marginBottom: 20,
            fontSize: 24,
            color: "#111827",
          }}
        >
          Course Sections
        </h2>

        {/* ADDED: если секций нет */}
        {sections.length === 0 ? (
          <div style={{ color: "#6B7280" }}>No sections found</div>
        ) : (
          <div style={{ display: "grid", gap: 16 }}>
            {sections.map((section) => (
              // ADDED: переход на одну секцию
              <Link
                key={section.id}
                to={`/sections/${section.id}`}
                style={{
                  textDecoration: "none",
                  background: "#F9FAFB",
                  border: "1px solid #E5E7EB",
                  borderRadius: 12,
                  padding: 16,
                  color: "#111827",
                  display: "block",
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: 8 }}>
                  Section #{section.id}
                </div>

                <div style={{ color: "#4B5563", lineHeight: 1.6 }}>
                  {section.content}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}