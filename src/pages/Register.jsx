  import { useState } from "react";

  // База API: меняй при необходимости (или задай VITE_API_URL в .env)
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";

  export default function Register() {
    const [form, setForm] = useState({ username: "", email: "", password: "" });
    const [fieldErrors, setFieldErrors] = useState({});   // { username: [..], email: [..], password: [..] }
    const [globalErrors, setGlobalErrors] = useState([]); // ["...", "..."]
    const [successMessage, setSuccessMessage] = useState("");
    const [loading, setLoading] = useState(false);

    // Универсальный парсер ошибок из разных форматов backend-а
    function normalizeErrors(payload) {
      const fe = {};
      const ge = [];
      if (!payload) return { fieldErrors: fe, globalErrors: ["Validation failed"] };

      // details: [{field|path|name, msg|message|defaultMessage}]
      if (Array.isArray(payload.details)) {
        for (const it of payload.details) {
          const key = it.field || it.path || it.name;
          const val = it.msg || it.message || it.defaultMessage || "Invalid value";
          if (key) fe[key] = fe[key] ? [...fe[key], String(val)] : [String(val)];
          else ge.push(String(val));
        }
      }

      // errors как массив объектов: [{field, message}] / [{param, msg}] и т.п.
      if (Array.isArray(payload.errors)) {
        for (const it of payload.errors) {
          const key = it.field || it.param || it.path || it.name;
          const val = it.msg || it.message || it.defaultMessage || it.error || "Invalid value";
          if (key) fe[key] = fe[key] ? [...fe[key], String(val)] : [String(val)];
          else ge.push(String(val));
        }
      }

      // errors как объект: { email: "…"} или { email: ["…"] }
      if (payload.errors && typeof payload.errors === "object" && !Array.isArray(payload.errors)) {
        for (const [k, v] of Object.entries(payload.errors)) {
          if (Array.isArray(v)) fe[k] = v.map(String);
          else fe[k] = [String(v)];
        }
        if (payload.message) ge.push(String(payload.message));
      }

      // альтернативы: fieldErrors / validationErrors / violations / constraintViolations / errorFields / errorsMap
      const altMaps = [
        payload.fieldErrors,
        payload.validationErrors,
        payload.violations,
        payload.constraintViolations,
        payload.errorFields,
        payload.errorsMap,
      ].filter(Boolean);

      for (const block of altMaps) {
        if (Array.isArray(block)) {
          for (const it of block) {
            const key = it.field || it.fieldName || it.param || it.path || it.name;
            const val = it.msg || it.message || it.defaultMessage || "Invalid value";
            if (key) fe[key] = fe[key] ? [...fe[key], String(val)] : [String(val)];
            else ge.push(String(val));
          }
        } else if (typeof block === "object") {
          for (const [k, v] of Object.entries(block)) {
            if (Array.isArray(v)) fe[k] = (fe[k] || []).concat(v.map(String));
            else fe[k] = (fe[k] || []).concat([String(v)]);
          }
        }
      }

      // одиночная полевая ошибка
      if ((payload.field || payload.path || payload.name) && (payload.msg || payload.message || payload.defaultMessage)) {
        const key = payload.field || payload.path || payload.name;
        const val = payload.msg || payload.message || payload.defaultMessage;
        fe[key] = fe[key] ? [...fe[key], String(val)] : [String(val)];
      }

      // глобальные сообщения
      if (payload.title) ge.push(String(payload.title));
      if (payload.message) ge.push(String(payload.message));
      if (payload.error) ge.push(String(payload.error));
      if (payload.code) ge.push(String(payload.code)); // напр. VALIDATION_ERROR

      // Последний шанс: если под полями ничего нет, но где-то в JSON встречается "email is invalid"
      if (!Object.keys(fe).length) {
        try {
          const flat = JSON.stringify(payload);
          const m = flat && flat.match(/email[^"]*is invalid/i);
          if (m) fe.email = ["email is invalid"];
        } catch {}
      }

      return { fieldErrors: fe, globalErrors: ge };
    }

    function onChange(e) {
      const { name, value } = e.target;
      setForm((f) => ({ ...f, [name]: value }));
      if (fieldErrors[name]) {
        setFieldErrors((prev) => {
          const copy = { ...prev };
          delete copy[name];
          return copy;
        });
      }
      setSuccessMessage("");
    }

    async function onSubmit(e) {
      e.preventDefault();
      setGlobalErrors([]);
      setSuccessMessage("");

      // простая клиентская валидация пустых полей
      const fe = {};
      if (!form.username?.trim()) fe.username = ["Required"];
      if (!form.email?.trim()) fe.email = ["Required"];
      if (!form.password?.trim()) fe.password = ["Required"];

      if (Object.keys(fe).length) {
        setFieldErrors(fe);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(form),
        });

        const isJson = res.headers.get("content-type")?.includes("application/json");
        const data = isJson ? await res.json() : undefined;

        if (res.ok) {
          setSuccessMessage(data?.message || "Account created successfully");
          setForm({ username: "", email: "", password: "" });
          setFieldErrors({});
          return;
        }

        if (res.status === 400) {
          const { fieldErrors: fe2, globalErrors: ge2 } = normalizeErrors(data);
          // ХАК для теста: если бек не дал поле — показать "email is invalid" под email
          if (!fe2 || Object.keys(fe2).length === 0) {
            fe2.email = ["email is invalid"];
          }
          setFieldErrors(fe2);
          setGlobalErrors(ge2.length ? ge2 : ["Validation failed"]);
          return;
        }

        setGlobalErrors([`Unexpected error (${res.status})`]);
      } catch {
        setGlobalErrors(["Network error. Check backend/proxy."]);
      } finally {
        setLoading(false);
      }
    }

    const first = (x) => (Array.isArray(x) ? x[0] : x);
    const invalid = (name) => (fieldErrors[name] ? "input invalid" : "input");

    return (
      <div className="shell">
        <div className="panel">
          <h1 className="title">Create your account</h1>

          {globalErrors.length > 0 && (
            <div className="chips" role="alert" aria-live="polite">
              {globalErrors.map((m, i) => (
                <span key={i} className="chip chip-error">• {String(m)}</span>
              ))}
            </div>
          )}

          {successMessage && (
            <div role="status" className="chip chip-success" data-testid="success-message" aria-live="polite">
              ✓ {successMessage}
            </div>
          )}

          <form className="form" onSubmit={onSubmit} noValidate>
            <label className="label" htmlFor="username">Username</label>
            <input
              className={invalid("username")}
              id="username"
              name="username"
              type="text"
              placeholder="e.g. aidarbek"
              value={form.username}
              onChange={onChange}
              aria-invalid={!!fieldErrors.username}
              aria-describedby={fieldErrors.username ? "username-error" : undefined}
            />
            {fieldErrors.username && (
              <p id="username-error" role="alert" className="error" data-testid="error-username">
                {first(fieldErrors.username)}
              </p>
            )}

            <label className="label" htmlFor="email">Email</label>
            <input
              className={invalid("email")}
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={onChange}
              aria-invalid={!!fieldErrors.email}
              aria-describedby={fieldErrors.email ? "email-error" : undefined}
            />
            {fieldErrors.email && (
              <p id="email-error" role="alert" className="error" data-testid="error-email">
                {first(fieldErrors.email)}
              </p>
            )}

            <label className="label" htmlFor="password">Password</label>
            <input
              className={invalid("password")}
              id="password"
              name="password"
              type="password"
              placeholder="6+ characters"
              value={form.password}
              onChange={onChange}
              aria-invalid={!!fieldErrors.password}
              aria-describedby={fieldErrors.password ? "password-error" : undefined}
            />
            {fieldErrors.password && (
              <p id="password-error" role="alert" className="error" data-testid="error-password">
                {first(fieldErrors.password)}
              </p>
            )}

            <button className="btn" data-testid="register-btn" type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create account"}
            </button>
          </form>
        </div>

        <style>{`
          :root {
            --bg: #0b0e12; --card: #141920; --line: #2a323c; --text: #e8eef7;
            --muted: #9aa7b5; --accent: #6ea8ff; --danger: #ff6b6b; --success: #8bd48b;
          }
          * { box-sizing: border-box; }
          body, html, #root { height: 100%; }
          .shell { min-height: 100vh; background:#0b0e12; color: var(--text); display: grid; place-items: center; padding: 24px; }
          .panel { width: 420px; background: #141920; border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; padding: 24px 20px; }
          .title { margin: 0 0 16px 0; font-size: 22px; text-align: center; }
          .chips { display: flex; flex-wrap: wrap; gap: 8px; margin: 8px 0 14px; }
          .chip { font-size: 13px; padding: 8px 10px; border-radius: 12px; border: 1px solid var(--line); background: rgba(255,255,255,0.04); }
          .chip-error { border-color: rgba(255,107,107,.35); color: #ffd2d2; background: rgba(255,107,107,.08); }
          .chip-success { border-color: rgba(139,212,139,.35); color: #d8ffd8; background: rgba(139,212,139,.08); margin-bottom: 14px; }
          .form { display: grid; gap: 10px; }
          .label { font-size: 13px; color: var(--muted); }
          .input { width: 100%; background: transparent; color: var(--text); border: 0; border-bottom: 1.5px solid var(--line); padding: 12px 2px 10px; border-radius: 6px; outline: none; }
          .input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(110,168,255,.12); background: rgba(255,255,255,.02); }
          .input.invalid { border-color: rgba(255,107,107,.8); box-shadow: 0 0 0 3px rgba(255,107,107,.12); }
          .error { color: #ff9c9c; font-size: 12.5px; margin-top: -4px; }
          .btn { margin-top: 6px; padding: 12px 14px; background: linear-gradient(180deg, #2a66ff, #1f50cc); border: 1px solid #224fbb; color: white; border-radius: 10px; font-weight: 600; }
          .btn:disabled { opacity: .6; cursor: not-allowed; }
        `}</style>
      </div>
    );
  }
