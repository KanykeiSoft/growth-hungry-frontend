import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import "../styles/CoursesPage.css";

const COURSE_THEMES = [
  "theme-blue",
  "theme-gold",
  "theme-purple",
  "theme-red",
  "theme-navy",
  "theme-green",
];

const CATEGORY_OPTIONS = [
  "All Courses",
  "Java",
  "Spring Boot",
  "Database",
  "AI & ML",
  "Web Dev",
];

function getCourseCategory(course) {
  const text = `${course?.title || ""} ${course?.description || ""}`.toLowerCase();

  if (text.includes("java")) return "Java";
  if (text.includes("spring")) return "Spring Boot";
  if (
    text.includes("sql") ||
    text.includes("database") ||
    text.includes("postgres") ||
    text.includes("mysql")
  ) {
    return "Database";
  }
  if (
    text.includes("ai") ||
    text.includes("ml") ||
    text.includes("machine learning") ||
    text.includes("rag")
  ) {
    return "AI & ML";
  }
  if (
    text.includes("react") ||
    text.includes("html") ||
    text.includes("css") ||
    text.includes("javascript") ||
    text.includes("frontend") ||
    text.includes("web")
  ) {
    return "Web Dev";
  }

  return "All Courses";
}

function getProgressPercent(course, index) {
  if (typeof course?.progress === "number") {
    return Math.max(0, Math.min(100, course.progress));
  }

  const fallbackValues = [35, 40, 0, 20, 25, 50, 60, 40];
  return fallbackValues[index % fallbackValues.length];
}

function getLessonsLabel(course, index) {
  if (course?.lessonsCount && course?.completedLessonsCount >= 0) {
    return `${course.completedLessonsCount}/${course.lessonsCount} lessons`;
  }

  const fallbackValues = [
    "7/20 lessons",
    "8/20 lessons",
    "Complete 8 lessons",
    "4/20 lessons",
    "5/20 lessons",
    "15/30 lessons",
    "12/20 lessons",
    "10/25 lessons",
  ];

  return fallbackValues[index % fallbackValues.length];
}

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All Courses");

  useEffect(() => {
    let alive = true;

    const loadCourses = async () => {
      try {
        setLoading(true);
        setErrorMsg("");

        const res = await api.get("/api/courses");
        if (!alive) return;

        const list = Array.isArray(res.data) ? res.data : [];
        setCourses(list);
      } catch (e) {
        if (!alive) return;

        setErrorMsg(
          e?.response?.data?.message ||
            e?.message ||
            "Failed to load courses"
        );
      } finally {
        if (alive) setLoading(false);
      }
    };

    loadCourses();

    return () => {
      alive = false;
    };
  }, []);

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const title = course?.title?.toLowerCase() || "";
      const description = course?.description?.toLowerCase() || "";
      const search = searchTerm.trim().toLowerCase();

      const matchesSearch =
        !search || title.includes(search) || description.includes(search);

      const courseCategory = getCourseCategory(course);
      const matchesCategory =
        activeCategory === "All Courses" || courseCategory === activeCategory;

      return matchesSearch && matchesCategory;
    });
  }, [courses, searchTerm, activeCategory]);

  if (loading) {
    return <div className="courses-state">Loading courses...</div>;
  }

  if (errorMsg) {
    return <div className="courses-state error">{errorMsg}</div>;
  }

  return (
    <div className="courses-page">
      <header className="courses-header">
        <div className="courses-search-wrap">
          <span className="search-icon">⌕</span>
          <input
            className="courses-search-input"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="courses-header-actions">
          <button className="filter-btn" type="button">
            Filter
          </button>

          <div className="header-links">
            <button type="button" className="header-link">
              Dashboard
            </button>
            <button type="button" className="header-link logout">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="courses-main">
        <div className="courses-hero">
          <h1 className="courses-title">Available Courses</h1>
          <p className="courses-subtitle">
            Select a course to view details or start learning.
          </p>
        </div>

        <div className="categories">
          {CATEGORY_OPTIONS.map((category) => (
            <button
              key={category}
              type="button"
              className={`category-chip ${
                activeCategory === category ? "active" : ""
              }`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        {filteredCourses.length === 0 ? (
          <div className="empty-state">
            <h3>No courses found</h3>
            <p>Try another search or choose a different category.</p>
          </div>
        ) : (
          <div className="course-grid">
            {filteredCourses.map((course, index) => {
              const theme = COURSE_THEMES[index % COURSE_THEMES.length];
              const progress = getProgressPercent(course, index);
              const lessonsLabel = getLessonsLabel(course, index);

              return (
                <article key={course.id} className={`course-card ${theme}`}>
                  <div className="course-card-body">
                    <h3 className="course-card-title">{course.title}</h3>

                    <p className="course-card-description">
                      {course.description || "Start learning this course"}
                    </p>

                    <div className="progress-row">
                      <div className="progress-track">
                        <div
                          className="progress-fill"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="course-stats">
                      <span>{lessonsLabel}</span>
                      <span>{progress}%</span>
                    </div>

                    {/* START COURSE */}
                    <Link
                      to={`/courses/${course.id}`}
                      className="start-course-btn"
                      style={{
                        display: "inline-block",
                        textAlign: "center",
                        textDecoration: "none",
                        width: "100%",
                        boxSizing: "border-box",
                        marginTop: "10px",
                      }}
                    >
                      Start Course
                    </Link>

                    {/* VIEW SECTIONS */}
                    <Link
                      to={`/courses/${course.id}/sections`}
                      className="start-course-btn"
                      style={{
                        display: "inline-block",
                        marginTop: "10px",
                        textAlign: "center",
                        textDecoration: "none",
                        width: "100%",
                        boxSizing: "border-box",
                      }}
                    >
                      View Sections
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}