// src/pages/Login.jsx
import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [globalErrors, setGlobalErrors] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const fromRef = useRef(location.state?.from || "/dashboard");

  useEffect(() => {
    if (isAuthenticated) navigate(fromRef.current, { replace: true });
  }, [isAuthenticated, navigate]);

  const first = (x) => (Array.isArray(x) ? x[0] : x);
  const invalid = (n) => (fieldErrors[n] ? "input invalid" : "input");

  function onChange(e) {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));

    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }

    if (globalErrors.length) setGlobalErrors([]);
    if (successMessage) setSuccessMessage("");
  }

  async function parseMaybeJson(res) {
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      try {
        return await res.json();
      } catch {
        // ignore
      }
    }

    try {
      const t = await res.text();
      if (!t) return undefined;

      try {
        return JSON.parse(t);
      } catch {
        return { message: t };
      }
    } catch {
      return undefined;
    }
  }

  async function onSubmit(e) {
    e.preventDefault();
    setGlobalErrors([]);
    setSuccessMessage("");

    const fe = {};
    if (!form.email?.trim()) fe.email = ["Required"];
    if (!form.password?.trim()) fe.password = ["Required"];

    if (Object.keys(fe).length) {
      setFieldErrors(fe);
      setGlobalErrors(["Please fill in all fields"]);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email.trim().toLowerCase(),
          password: form.password,
        }),
      });

      const data = await parseMaybeJson(res);

      if (res.ok) {
        const token = data?.accessToken || data?.token || data?.jwt || null;

        if (!token) {
          setSuccessMessage(data?.message || "Logged in (no token returned)");
          setGlobalErrors([
            "Backend did not return a token. Check /api/auth/login response.",
          ]);
          return;
        }

        const user = data?.user || data?.profile || null;

        login({ token, user });

        setSuccessMessage(data?.message || "Logged in successfully");
        navigate(fromRef.current, { replace: true });
        return;
      }

      if (res.status === 401) {
        setGlobalErrors([data?.message || "Wrong email or password"]);
        return;
      }

      if (res.status === 400 || res.status === 422) {
        const fe2 = {};
        if (data?.errors && typeof data.errors === "object") {
          for (const [k, v] of Object.entries(data.errors)) {
            fe2[k] = Array.isArray(v) ? v.map(String) : [String(v)];
          }
        }

        if (Object.keys(fe2).length) setFieldErrors(fe2);
        setGlobalErrors([data?.message || "Validation failed"]);
        return;
      }

      setGlobalErrors([data?.message || `Unexpected error (${res.status})`]);
    } catch {
      setGlobalErrors(["Network error"]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      {globalErrors.length > 0 && (
        <div className="toast toast-error" role="alert">
          {globalErrors.join(" • ")}
        </div>
      )}

      {successMessage && (
        <div className="toast toast-success" role="status">
          {successMessage}
        </div>
      )}

      <div className="card login-card">
        <h1>Login</h1>
        <p className="sub">Enter your credentials to continue</p>

        <form className="form" noValidate onSubmit={onSubmit}>
          <div className="field">
            <label>Email</label>
            <input
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={onChange}
              className={invalid("email")}
              autoComplete="email"
            />
            {fieldErrors.email && (
              <div id="err-email" className="hint-error">
                {first(fieldErrors.email)}
              </div>
            )}
          </div>

          <div className="field">
            <label>Password</label>
            <input
              name="password"
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={onChange}
              className={invalid("password")}
              autoComplete="current-password"
            />
            {fieldErrors.password && (
              <div id="err-password" className="hint-error">
                {first(fieldErrors.password)}
              </div>
            )}
          </div>

          <button className="primary big-btn" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>
      </div>

      <style>{`
        * { box-sizing: border-box; }

        .page {
          min-height: 100vh;
          display: grid;
          place-items: center;
          background: #FFFFFF;
          color: #111827;
          padding: 24px;
        }

        .login-card {
          width: 420px;
          max-width: 100%;
          background: #FFFFFF;
          color: #111827;
          border: 1px solid #E5E7EB;
          border-radius: 16px;
          padding: 24px 20px;
          box-shadow: 0 10px 24px rgba(37, 99, 235, 0.08);
        }

        .login-card h1 {
          margin: 0 0 8px;
          color: #111827;
        }

        .sub {
          color: #6B7280;
          margin-top: 4px;
        }

        .form {
          display: grid;
          gap: 12px;
          margin-top: 12px;
        }

        .field {
          display: grid;
          gap: 6px;
          text-align: left;
        }

        .field label {
          color: #111827;
          font-size: 14px;
          font-weight: 500;
        }

        .input {
          width: 100%;
          background: #FFFFFF;
          color: #111827;
          border: 1px solid #D1D5DB;
          padding: 12px 10px;
          border-radius: 10px;
          outline: none;
          transition: .15s border, .15s box-shadow;
        }

        .input:focus {
          border-color: #2563EB;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
        }

        .input.invalid {
          border-color: #EF4444;
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.12);
        }

        .hint-error {
          color: #B91C1C;
          font-size: 12.5px;
          margin-top: -2px;
        }

        .primary.big-btn {
          margin-top: 6px;
          padding: 14px 16px;
          background: linear-gradient(135deg, #2563EB, #1D4ED8);
          border: none;
          color: #FFFFFF;
          border-radius: 10px;
          font-weight: 700;
          transition: .2s filter, .2s transform;
          cursor: pointer;
        }

        .primary.big-btn:hover:not(:disabled) {
          filter: brightness(1.03);
          transform: translateY(-1px);
        }

        .primary.big-btn:disabled {
          opacity: .65;
          cursor: not-allowed;
        }

        .toast {
          margin-bottom: 14px;
          padding: 10px 12px;
          border-radius: 10px;
          width: 420px;
          max-width: 100%;
        }

        .toast-error {
          background: #FEF2F2;
          border: 1px solid #FECACA;
          color: #991B1B;
        }

        .toast-success {
          background: #EFF6FF;
          border: 1px solid #BFDBFE;
          color: #1D4ED8;
        }

        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 30px #FFFFFF inset !important;
          -webkit-text-fill-color: #111827 !important;
          caret-color: #111827;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}