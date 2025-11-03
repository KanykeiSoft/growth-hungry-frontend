// src/api/client.js
import axios from "axios";

// Достаём токен (можно заменить на геттер из AuthContext при желании)
function getToken() {
  return localStorage.getItem("token");
}

// Базовый URL: из .env или локальный бэкенд
const baseURL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export const api = axios.create({
  baseURL,       // пример: http://localhost:8080
  timeout: 30000 // 30s
});

// Добавляем токен ко всем запросам автоматически
api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (!config.headers["Content-Type"]) {
    config.headers["Content-Type"] = "application/json";
  }
  return config;
});

// (Опционально) Глобальная обработка ошибок
api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Здесь можно централизованно ловить 401/403 и т.п.
    return Promise.reject(err);
  }
);
