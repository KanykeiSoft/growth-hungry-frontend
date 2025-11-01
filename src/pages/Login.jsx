
// src/pages/Login.jsx
import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [globalErrors, setGlobalErrors] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // один раз запоминаем, куда вернуть пользователя
  const fromRef = useRef(location.state?.from || "/chat");
  const cameFromProtected = location.state?.fromProtected === true;

  // уведомление, если пришли с защищённой страницы
  useEffect(() => {
    if (cameFromProtected) {
      setGlobalErrors(["You must be logged in to access the chat."]);
      // очистим state, чтобы при F5 тост не повторялся
      window.history.replaceState({}, document.title, "/login");
    }
  }, [cameFromProtected]);

  // если уже авторизованы — возвращаем туда, куда шёл
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
      } catch  {
        // игнорируем ошибку парсинга, ниже попробуем как текст
        return undefined;
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
        if (data && (data.success === false || data.authenticated === false || data.error)) {
          setGlobalErrors([data.message || data.error || "Wrong login or password"]);
          return;
        }

        // сохраняем токен (авторизация)
        if (data?.accessToken) {
          login(data.accessToken);
        } else {
          // временный токен для локальной проверки ProtectedRoute
          login("DUMMY_TOKEN");
        }

        setSuccessMessage(data?.message || "Logged in successfully");
        // навигация произойдёт в useEffect по isAuthenticated
        return;
      }

      if (res.status === 401) {
        setGlobalErrors([data?.message || "Wrong login or password"]);
        return;
      }

      if (res.status === 400) {
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
            />
            {fieldErrors.username && (
              <div id="err-username" className="hint-error">
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
  *{box-sizing:border-box}
  .page{
    min-height:100vh;display:grid;place-items:center;
    background:#f3ede6;color:#3b2f2f;padding:24px
  }
  .card{
    width:420px;background:#fff;color:#3b2f2f;
    border:1px solid #e7e1d9;border-radius:16px;
    padding:24px 20px;box-shadow:0 8px 20px rgba(0,0,0,.05)
  }
  .sub{color:#7c7068;margin-top:4px}
  .form{display:grid;gap:12px;margin-top:12px}
  .field{display:grid;gap:6px}
  .input{
    width:100%;background:#fff;color:#3b2f2f;
    border:1px solid #d9d3cc;padding:12px 10px;
    border-radius:10px;outline:none;transition:.15s border,.15s box-shadow
  }
  .input:focus{
    border-color:#b88656;box-shadow:0 0 0 3px rgba(184,134,86,.25)
  }
  .input.invalid{
    border-color:#ef4444;box-shadow:0 0 0 3px rgba(239,68,68,.15)
  }
  .hint-error{color:#b00020;font-size:12.5px;margin-top:-2px}
  .primary.big-btn{
    margin-top:6px;padding:12px 14px;
    background:linear-gradient(180deg,#c69c6d,#a47848);
    border:1px solid #a47848;color:#fff;
    border-radius:10px;font-weight:600;
    transition:.2s filter
  }
  .primary.big-btn:hover{filter:brightness(1.05)}
  .toast{margin-bottom:14px;padding:10px 12px;border-radius:10px}
  .toast-error{
    background:rgba(239,68,68,.08);
    border:1px solid rgba(239,68,68,.35);color:#7f1d1d
  }
  .toast-success{
    background:rgba(172,133,98,.1);
    border:1px solid rgba(172,133,98,.35);color:#5d3e22
  }
  input:-webkit-autofill,
  input:-webkit-autofill:focus{
    -webkit-box-shadow:0 0 0 30px #fff inset !important;
    -webkit-text-fill-color:#3b2f2f !important;
    caret-color:#3b2f2f;
  }
`}</style>
    </div>
  );
}
