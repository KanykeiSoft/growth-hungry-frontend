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

  if (loading) return <div style={{ padding: 24 }}>Loading…</div>;
  if (!section) return <div style={{ padding: 24 }}>Section not found</div>;

  return (
    <div style={{ padding: 24 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) 420px",
          gap: 24,
          alignItems: "start",
        }}
      >
        {/* LEFT */}
        <div>
          <h2 style={{ marginTop: 0 }}>Section</h2>
          <div>{section.content}</div>
        </div>

        {/* RIGHT */}
        <aside style={{ position: "sticky", top: 24 }}>
          <div
            style={{
              background: "#fff",
              border: "1px solid #eee",
              borderRadius: 16,
              overflow: "hidden",
              boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
              height: "calc(100vh - 120px)", // чтобы чат не расползался
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                padding: "12px 14px",
                borderBottom: "1px solid #f0f0f0",
                fontWeight: 700,
              }}
            >
              AI Assistant
            </div>

            {/* сам чат */}
            <div style={{ flex: 1, minHeight: 0 }}>
              <Chat sectionId={sectionId} />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

