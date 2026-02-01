// src/pages/CoursePage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api/client";

export default function CoursePage() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setErrorMsg("");

        const res = await api.get(`/api/courses/${courseId}/sections`);
        const list = Array.isArray(res.data) ? res.data : [];

        if (!alive) return;
        setSections(list);
      } catch (e) {
        if (!alive) return;
        setErrorMsg(
          e?.response?.data?.message ||
          e?.message ||
          "Failed to load sections"
        );
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => { alive = false; };
  }, [courseId]);

  if (loading) return <div style={{ padding: 24 }}>Loading sections…</div>;
  if (errorMsg) return <div style={{ padding: 24, color: "crimson" }}>{errorMsg}</div>;

  return (
    <div style={{ padding: 24 }}>
      <h2>Course {courseId}</h2>

      {sections.length === 0 && (
        <p>No sections yet.</p>
      )}

      <ul>
        {sections.map((s) => (
          <li key={s.id}>
            <button onClick={() => navigate(`/courses/${courseId}/sections/${s.id}`)}>
              Open section #{s.id}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
