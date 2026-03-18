import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api/client";

export default function CoursePage() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let alive = true;

    const loadCourseData = async () => {
      try {
        setLoading(true);
        setErrorMsg("");

        const [courseRes, sectionsRes] = await Promise.all([
          api.get(`/api/courses/${courseId}`),
          api.get(`/api/courses/${courseId}/sections`)
        ]);

        if (!alive) return;

        setCourse(courseRes.data || null);
        setSections(Array.isArray(sectionsRes.data) ? sectionsRes.data : []);
      } catch (e) {
        if (!alive) return;

        setErrorMsg(
          e?.response?.data?.message ||
            e?.message ||
            "Failed to load course"
        );
      } finally {
        if (alive) setLoading(false);
      }
    };

    loadCourseData();

    return () => {
      alive = false;
    };
  }, [courseId]);

  if (loading) {
    return <div style={{ padding: 24 }}>Loading course...</div>;
  }

  if (errorMsg) {
    return <div style={{ padding: 24, color: "crimson" }}>{errorMsg}</div>;
  }

  if (!course) {
    return <div style={{ padding: 24 }}>Course not found</div>;
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        padding: "32px",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        <button
          onClick={() => navigate("/courses")}
          style={{
            marginBottom: 20,
            border: "none",
            background: "#e5e7eb",
            color: "#111827",
            padding: "10px 16px",
            borderRadius: 10,
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          ← Back to Courses
        </button>

        <div
          style={{
            background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
            color: "white",
            borderRadius: 24,
            padding: "32px",
            boxShadow: "0 12px 30px rgba(37, 99, 235, 0.18)",
            marginBottom: 28,
          }}
        >
          <div
            style={{
              display: "inline-block",
              background: "rgba(255,255,255,0.18)",
              padding: "6px 12px",
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 700,
              marginBottom: 14,
            }}
          >
            Course
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: 34,
              fontWeight: 800,
            }}
          >
            {course.title}
          </h1>

          <p
            style={{
              marginTop: 14,
              marginBottom: 0,
              fontSize: 16,
              lineHeight: 1.7,
              maxWidth: 760,
              color: "rgba(255,255,255,0.92)",
            }}
          >
            {course.description || "Start learning this course step by step."}
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: 24,
            alignItems: "start",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: 22,
              padding: 24,
              border: "1px solid #e5e7eb",
              boxShadow: "0 8px 24px rgba(15, 23, 42, 0.05)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: 24,
                  color: "#111827",
                }}
              >
                Course Sections
              </h2>

              <span
                style={{
                  background: "#eff6ff",
                  color: "#1d4ed8",
                  padding: "8px 12px",
                  borderRadius: 999,
                  fontWeight: 700,
                  fontSize: 13,
                }}
              >
                {sections.length} sections
              </span>
            </div>

            {sections.length === 0 ? (
              <div style={{ color: "#6b7280" }}>No sections found.</div>
            ) : (
              <div style={{ display: "grid", gap: 16 }}>
                {sections.map((section, index) => (
                  <div
                    key={section.id}
                    style={{
                      border: "1px solid #e5e7eb",
                      borderRadius: 18,
                      padding: 18,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 16,
                      background: "#ffffff",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          display: "inline-block",
                          marginBottom: 8,
                          background: "#f3f4f6",
                          color: "#374151",
                          borderRadius: 999,
                          padding: "5px 10px",
                          fontSize: 12,
                          fontWeight: 700,
                        }}
                      >
                        Section {index + 1}
                      </div>

                      <h3
                        style={{
                          margin: "0 0 8px 0",
                          fontSize: 18,
                          color: "#111827",
                        }}
                      >
                        {section.title || `Section ${index + 1}`}
                      </h3>

                      <p
                        style={{
                          margin: 0,
                          color: "#6b7280",
                          fontSize: 14,
                        }}
                      >
                        Open this section and learn with the AI assistant.
                      </p>
                    </div>

                    <button
                      onClick={() =>
                        navigate(`/courses/${courseId}/sections/${section.id}`)
                      }
                      style={{
                        border: "none",
                        background: "#2563eb",
                        color: "white",
                        padding: "12px 18px",
                        borderRadius: 12,
                        cursor: "pointer",
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                      }}
                    >
                      Open Section
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <aside
            style={{
              background: "#ffffff",
              borderRadius: 22,
              padding: 24,
              border: "1px solid #e5e7eb",
              boxShadow: "0 8px 24px rgba(15, 23, 42, 0.05)",
              position: "sticky",
              top: 24,
            }}
          >
            <h3
              style={{
                marginTop: 0,
                marginBottom: 14,
                color: "#111827",
                fontSize: 20,
              }}
            >
              Course Overview
            </h3>

            <div style={{ display: "grid", gap: 14 }}>
              <div
                style={{
                  background: "#f8fafc",
                  borderRadius: 16,
                  padding: 16,
                }}
              >
                <div style={{ color: "#6b7280", fontSize: 13 }}>Course ID</div>
                <div
                  style={{
                    marginTop: 4,
                    color: "#111827",
                    fontWeight: 700,
                  }}
                >
                  {course.id}
                </div>
              </div>

              <div
                style={{
                  background: "#f8fafc",
                  borderRadius: 16,
                  padding: 16,
                }}
              >
                <div style={{ color: "#6b7280", fontSize: 13 }}>Sections</div>
                <div
                  style={{
                    marginTop: 4,
                    color: "#111827",
                    fontWeight: 700,
                  }}
                >
                  {sections.length}
                </div>
              </div>

              <div
                style={{
                  background: "#f8fafc",
                  borderRadius: 16,
                  padding: 16,
                }}
              >
                <div style={{ color: "#6b7280", fontSize: 13 }}>Status</div>
                <div
                  style={{
                    marginTop: 4,
                    color: "#111827",
                    fontWeight: 700,
                  }}
                >
                  Ready to study
                </div>
              </div>
            </div>

            {sections.length > 0 && (
              <button
                onClick={() =>
                  navigate(`/courses/${courseId}/sections/${sections[0].id}`)
                }
                style={{
                  marginTop: 20,
                  width: "100%",
                  border: "none",
                  background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                  color: "white",
                  padding: "14px 18px",
                  borderRadius: 14,
                  cursor: "pointer",
                  fontWeight: 700,
                  fontSize: 15,
                }}
              >
                Start First Section
              </button>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}