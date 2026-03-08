// src/pages/Register.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [globalErrors, setGlobalErrors] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

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

  function normalizePayload(f) {
    return {
      username: f.username?.trim(),
      email: f.email?.trim().toLowerCase(),
      password: f.password ?? "",
    };
  }

  async function parseMaybeJson(res) {
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      try {
        return await res.json();
      } catch (e) {
        console.error(e);
      }
    }
    try {
      const text = await res.text();
      if (!text) return undefined;
      try {
        return JSON.parse(text);
      } catch {
        return { message: text };
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
    if (!form.username?.trim()) fe.username = ["Required"];
    if (!form.email?.trim()) fe.email = ["Required"];
    if (!form.password?.trim()) fe.password = ["Required"];
    if (form.password && form.password.length < 6) {
      fe.password = [...(fe.password || []), "Min length is 6"];
    }

    if (Object.keys(fe).length) {
      setFieldErrors(fe);
      setGlobalErrors(["Please correct the highlighted fields"]);
      return;
    }

    const payload = normalizePayload(form);

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await parseMaybeJson(res);

      if (res.ok) {
        const msg = data?.message || "Account created. Please log in.";
        setSuccessMessage(msg);

        navigate("/login", {
          replace: true,
          state: { flash: { type: "success", text: msg } },
        });
        return;
      }

      if (res.status === 409) {
        setGlobalErrors([data?.message || "Username or email already exists"]);

        const fe2 = {};
        if (data?.errors && typeof data.errors === "object") {
          for (const [k, v] of Object.entries(data.errors)) {
            fe2[k] = Array.isArray(v) ? v.map(String) : [String(v)];
          }
          if (Object.keys(fe2).length) setFieldErrors(fe2);
        }
        return;
      }

      if (res.status === 422 || res.status === 400) {
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

      <div className="card register-card">
        <h1>Create your account</h1>
        <p className="sub">Fill in the fields to sign up</p>

        <form className="form" noValidate onSubmit={onSubmit}>
          <div className="field">
            <label>Username</label>
            <input
              name="username"
              placeholder="e.g. aidarbek"
              value={form.username}
              onChange={onChange}
              className={invalid("username")}
              autoComplete="username"
            />
            {fieldErrors.username && (
              <div className="hint-error">{first(fieldErrors.username)}</div>
            )}
          </div>

          <div className="field">
            <label>Email</label>
            <input
              name="email"
              placeholder="you@example.com"
              type="email"
              value={form.email}
              onChange={onChange}
              className={invalid("email")}
              autoComplete="email"
            />
            {fieldErrors.email && (
              <div className="hint-error">{first(fieldErrors.email)}</div>
            )}
          </div>

          <div className="field">
            <label>Password</label>
            <input
              name="password"
              placeholder="6+ characters"
              type="password"
              value={form.password}
              onChange={onChange}
              className={invalid("password")}
              autoComplete="new-password"
            />
            {fieldErrors.password && (
              <div className="hint-error">{first(fieldErrors.password)}</div>
            )}
          </div>

          <button className="primary big-btn" type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create account"}
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

        .register-card {
          width: 420px;
          max-width: 100%;
          background: #FFFFFF;
          color: #111827;
          border: 1px solid #E5E7EB;
          border-radius: 16px;
          padding: 24px 20px;
          box-shadow: 0 10px 24px rgba(37, 99, 235, 0.08);
        }

        .register-card h1 {
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
      `}</style>
    </div>
  );
}