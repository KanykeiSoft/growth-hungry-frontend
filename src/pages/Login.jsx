import { useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState({});   // { username: ["..."], password: ["..."] }
  const [globalErrors, setGlobalErrors] = useState([]); // ["..."]
  const [successMessage, setSuccessMessage] = useState(""); // зелёный тост при успехе
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

  async function parseMaybeJson(res) {
    const ct = res.headers.get("content-type") || "";
    // если явно JSON
    if (ct.includes("application/json")) {
      try { return await res.json(); } catch { /* fallthrough */ }
    }
    // иначе пробуем читать текст и парсить
    try {
      const t = await res.text();
      if (!t) return undefined;
      try { return JSON.parse(t); } catch { return { message: t }; }
    } catch {
      return undefined;
    }
  }

  async function onSubmit(e) {
    e.preventDefault();
    setGlobalErrors([]);
    setSuccessMessage("");

    // клиентская валидация
    const fe = {};
    if (!form.username?.trim()) fe.username = ["Required"];
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
        credentials: "include",
        body: JSON.stringify(form),
      });

      const data = await parseMaybeJson(res);

      if (res.ok) {
        // если бек возвращает 200, но с success:false/error внутри — считаем ошибкой
        if (data && (data.success === false || data.authenticated === false || data.error)) {
          setGlobalErrors([data.message || data.error || "Wrong login or password"]);
          return;
        }
        // 200/201/204 — успех
        setSuccessMessage(data?.message || "Logged in successfully");
        return;
      }

      if (res.status === 401) {
        setGlobalErrors([data?.message || "Wrong login or password"]);
        return;
      }

      if (res.status === 400) {
        // Полевые ошибки, если пришли
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

      // прочие статусы
      setGlobalErrors([data?.message || `Unexpected error (${res.status})`]);
    } catch {
      setGlobalErrors(["Network error"]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      {/* красный тост */}
      {globalErrors.length > 0 && (
        <div className="toast toast-error" role="alert" aria-live="polite">
          {globalErrors.join(" • ")}
        </div>
      )}
      {/* зелёный тост */}
      {successMessage && (
        <div className="toast toast-success" role="status" aria-live="polite">
          {successMessage}
        </div>
      )}

      <div className="card">
        <h1>Login</h1>
        <p className="sub">Enter your credentials to continue</p>

        <form className="form" noValidate onSubmit={onSubmit}>
          <div className="field">
            <label>Username or Email</label>
            <input
              name="username"
              autoComplete="username"
              placeholder="Username or email"
              type="text"
              value={form.username}
              onChange={onChange}
              className={invalid("username")}
              aria-invalid={!!fieldErrors.username}
              aria-describedby={fieldErrors.username ? "err-username" : undefined}
            />
            {fieldErrors.username && (
              <div id="err-username" role="alert" className="hint-error">
                {first(fieldErrors.username)}
              </div>
            )}
          </div>

          <div className="field">
            <label>Password</label>
            <input
              name="password"
              autoComplete="current-password"
              placeholder="••••••"
              type="password"
              value={form.password}
              onChange={onChange}
              className={invalid("password")}
              aria-invalid={!!fieldErrors.password}
              aria-describedby={fieldErrors.password ? "err-password" : undefined}
            />
            {fieldErrors.password && (
              <div id="err-password" role="alert" className="hint-error">
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
        *{box-sizing:border-box}
        .page{min-height:100vh;display:grid;place-items:center;background:#0b0e12;color:#e8eef7;padding:24px}
        .card{width:420px;background:#141920;border:1px solid rgba(255,255,255,.06);border-radius:16px;padding:24px 20px}
        .sub{color:#9aa7b5;margin-top:4px}
        .form{display:grid;gap:12px;margin-top:12px}
        .field{display:grid;gap:6px}
        .input{width:100%;background:transparent;color:#e8eef7;border:0;border-bottom:1.5px solid #2a323c;padding:12px 2px 10px;border-radius:6px;outline:none}
        .input.invalid{border-color:rgba(255,107,107,.85);box-shadow:0 0 0 3px rgba(255,107,107,.12)}
        .hint-error{color:#ff9c9c;font-size:12.5px;margin-top:-2px}
        .primary.big-btn{margin-top:6px;padding:12px 14px;background:linear-gradient(180deg,#2a66ff,#1f50cc);border:1px solid #224fbb;color:#fff;border-radius:10px;font-weight:600}
        .toast{margin-bottom:14px;padding:10px 12px;border-radius:10px}
        .toast-error{background:rgba(255,107,107,.08);border:1px solid rgba(255,107,107,.35);color:#ffd2d2}
        .toast-success{background:rgba(139,212,139,.10);border:1px solid rgba(139,212,139,.35);color:#d8ffd8}
      `}</style>
    </div>
  );
}
