// src/pages/SectionPage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api/client";
import Chat from "../components/Chat";

export default function SectionPage() {
  const { sectionId } = useParams();
  const [section, setSection] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const res = await api.get(`/api/sections/${sectionId}`);
        if (!alive) return;
        setSection(res.data);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [sectionId]);

  if (loading) {
    return (
      <div style={{ padding: 24, color: "#6B7280", background: "#FFFFFF" }}>
        Loading…
      </div>
    );
  }

  if (!section) {
    return (
      <div style={{ padding: 24, color: "#6B7280", background: "#FFFFFF" }}>
        Section not found
      </div>
    );
  }

  return (
    <div
      style={{
        padding: 24,
        background: "#F8FAFC",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) 420px",
          gap: 24,
          alignItems: "start",
        }}
      >
        {/* LEFT */}
        <div
          style={{
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
              marginBottom: 16,
              color: "#111827",
              fontSize: 24,
            }}
          >
            Section
          </h2>

          <div
            style={{
              color: "#374151",
              fontSize: 16,
              lineHeight: 1.7,
            }}
          >
            {section.content}
          </div>
        </div>

        {/* RIGHT */}
        <aside style={{ position: "sticky", top: 24 }}>
          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid #E5E7EB",
              borderRadius: 16,
              overflow: "hidden",
              boxShadow: "0 8px 24px rgba(37,99,235,0.08)",
              height: "calc(100vh - 120px)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                padding: "14px 16px",
                borderBottom: "1px solid #E5E7EB",
                fontWeight: 700,
                fontSize: 18,
                color: "#111827",
                background: "#FFFFFF",
              }}
            >
              AI Assistant
            </div>

            <div style={{ flex: 1, minHeight: 0, background: "#FFFFFF" }}>
              <Chat sectionId={sectionId} />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}