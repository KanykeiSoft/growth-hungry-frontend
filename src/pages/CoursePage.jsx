// src/pages/CoursePage.jsx
import React from "react";
import { useParams } from "react-router-dom";

export default function CoursePage() {
  const { courseId } = useParams();

  return (
    <div style={{ padding: 24 }}>
      <h2>CoursePage</h2>
      <p>courseId from URL: <b>{courseId}</b></p>
    </div>
  );
}
