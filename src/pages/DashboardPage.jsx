import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import "../styles/dashboard.css";

const CATEGORY_OPTIONS = [
  "All Courses",
  "Java",
  "Spring Boot",
  "Database",
  "AI & ML",
  "Web Dev",
];

const COURSE_THEMES = [
  "theme-blue",
  "theme-gold",
  "theme-purple",
  "theme-red",
  "theme-navy",
  "theme-green",
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

function getCourseProgress(course, index) {
  if (typeof course?.progress === "number") {
    return Math.max(0, Math.min(100, course.progress));
  }

  const fallback = [35, 50, 20, 60, 40, 15, 75, 30];
  return fallback[index % fallback.length];
}

function getLessonLabel(course, index) {
  if (
    typeof course?.completedLessonsCount === "number" &&
    typeof course?.lessonsCount === "number"
  ) {
    return `${course.completedLessonsCount}/${course.lessonsCount} lessons`;
  }

  const fallback = [
    "7/20 lessons",
    "10/24 lessons",
    "4/18 lessons",
    "12/20 lessons",
    "8/16 lessons",
    "3/14 lessons",
  ];

  return fallback[index % fallback.length];
}

export default function DashboardPage() {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [startingCourseId, setStartingCourseId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All Courses");

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setErrorMsg("");

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
        if (alive) {
          setLoading(false);
        }
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const title = course?.title?.toLowerCase() || "";
      const description = course?.description?.toLowerCase() || "";
      const query = searchTerm.trim().toLowerCase();

      const matchesSearch =
        !query || title.includes(query) || description.includes(query);

      const category = getCourseCategory(course);
      const matchesCategory =
        activeCategory === "All Courses" || category === activeCategory;

      return matchesSearch && matchesCategory;
    });
  }, [courses, searchTerm, activeCategory]);

  const handleStartCourse = async (courseId) => {
    try {
      setStartingCourseId(courseId);
      setErrorMsg("");

      const res = await api.get(`/api/courses/${courseId}/sections`);
      const sections = Array.isArray(res.data) ? res.data : [];

      if (!sections.length) {
        alert("This course does not have sections yet.");
        return;
      }

      const firstSection = [...sections].sort(
        (a, b) => (a.id ?? 0) - (b.id ?? 0)
      )[0];

      if (!firstSection?.id) {
        alert("Could not determine the first section.");
        return;
      }

      navigate(`/sections/${firstSection.id}`);
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

  const handleViewSections = (courseId) => {
    navigate(`/courses/${courseId}/sections`);
  };

  return (
    <div className="dash">
      <section className="dash__left">
        <header className="dash__topbar">
          <div className="dash__searchWrap">
            <span className="dash__searchIcon">⌕</span>
            <input
              className="dash__search"
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="dash__topbarActions">
            <button className="dash__filterBtn" type="button">
              Filter
            </button>
          </div>
        </header>

        <header className="dash__header">
          <h2>Available Courses</h2>
          <p>Select a course to view details or start learning.</p>
        </header>

        <div className="dash__categories">
          {CATEGORY_OPTIONS.map((category) => (
            <button
              key={category}
              type="button"
              className={`dash__chip ${
                activeCategory === category ? "active" : ""
              }`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        {loading && <div className="dash__state">Loading...</div>}

        {!loading && errorMsg && (
          <div className="dash__state dash__state--error">{errorMsg}</div>
        )}

        {!loading && !errorMsg && filteredCourses.length === 0 && (
          <div className="dash__empty">
            <h3>No courses found</h3>
            <p>Try another search or choose a different category.</p>
          </div>
        )}

        {!loading && !errorMsg && filteredCourses.length > 0 && (
          <div className="dash__grid">
            {filteredCourses.map((course, index) => {
              const progress = getCourseProgress(course, index);
              const lessonsLabel = getLessonLabel(course, index);
              const theme = COURSE_THEMES[index % COURSE_THEMES.length];

              return (
                <article key={course.id} className={`course ${theme}`}>
                  <div className="course__body">
                    <h3 className="course__title">{course.title}</h3>

                    <p className="course__desc">
                      {course.description || "Start learning this course"}
                    </p>

                    <div className="course__progress">
                      <div className="course__progressTrack">
                        <div
                          className="course__progressFill"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="course__meta">
                      <span>{lessonsLabel}</span>
                      <span>{progress}%</span>
                    </div>

                    <div style={{ display: "grid", gap: "10px", marginTop: "10px" }}>
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

                      <button
                        className="course__btn"
                        type="button"
                        onClick={() => handleViewSections(course.id)}
                      >
                        View Sections
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}