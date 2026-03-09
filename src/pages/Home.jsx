import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/home.css";

export default function Home() {
  const featuresRef = useRef(null);
  const [featuresVisible, setFeaturesVisible] = useState(false);

  useEffect(() => {
    const node = featuresRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setFeaturesVisible(true);
          observer.unobserve(node);
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  return (
    <main className="home">
      <section className="hero">
        <div className="hero__content">
          <div className="hero__badge">AI-powered learning assistant</div>

          <h1>Your AI Assistant for Learning and Personal Growth</h1>

          <p className="hero__text">
            Plan your goals, learn step by step, and get AI help inside each
            course section.
          </p>

          <div className="hero__actions">
            <Link to="/register" className="btn btn-primary">
              Get Started
            </Link>
          </div>
        </div>

        <div className="hero__visual">
          <div className="dashboard-mockup dashboard-mockup--clean">
            <div className="dashboard-mockup__top">My Courses</div>

            <div className="course-card course-card--progress">
              <div className="course-card__icon">☕</div>
              <div className="course-card__content">
                <div className="course-card__row">
                  <h4>Java Basics</h4>
                  <span className="course-card__percent">65%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-bar__fill" style={{ width: "65%" }} />
                </div>
              </div>
            </div>

            <div className="course-card course-card--progress">
              <div className="course-card__icon">💻</div>
              <div className="course-card__content">
                <div className="course-card__row">
                  <h4>HTML, CSS, React</h4>
                  <span className="course-card__percent">42%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-bar__fill" style={{ width: "42%" }} />
                </div>
              </div>
            </div>

            <div className="course-card course-card--progress">
              <div className="course-card__icon">🧠</div>
              <div className="course-card__content">
                <div className="course-card__row">
                  <h4>Problem Solving & Arrays</h4>
                  <span className="course-card__percent">80%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-bar__fill" style={{ width: "80%" }} />
                </div>
              </div>
            </div>

            <div className="dashboard-stats">
              <div className="dashboard-stat">
                <strong>12</strong>
                <span>Courses</span>
              </div>

              <div className="dashboard-stat">
                <strong>340</strong>
                <span>Lessons</span>
              </div>

              <div className="dashboard-stat">
                <strong>Progress</strong>
                <span>Growing</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        ref={featuresRef}
        className={`features reveal ${featuresVisible ? "show" : ""}`}
      >
        <div className="feature">
          <h3>Learn by sections</h3>
          <p>Each course is organized step by step so users stay focused.</p>
        </div>

        <div className="feature">
          <h3>AI support inside lessons</h3>
          <p>
            Ask questions directly in the current section and get contextual
            help.
          </p>
        </div>

        <div className="feature">
          <h3>Clean dashboard</h3>
          <p>Track courses, continue learning, and return to saved progress.</p>
        </div>
      </section>
    </main>
  );
}