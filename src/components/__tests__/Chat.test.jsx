// src/components/__tests__/Chat.test.jsx
/// <reference types="vitest" />
/**
 * @vitest-environment jsdom
 */
import { vi, beforeEach, describe, it, expect } from "vitest";

// ---------- Моки ДОЛЖНЫ быть до любых импортов тестируемых модулей ----------

const navigateMock = vi.fn();
const logoutMock = vi.fn();
const postMock = vi.fn();

// react-router-dom: подменяем только useNavigate, остальное — реальное
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

// useAuth: возвращаем предсказуемый контекст
vi.mock("../../auth/useAuth", () => ({
  useAuth: () => ({
    token: "test-token",
    user: { id: 1, name: "Tester" },
    isAuthenticated: true,
    login: vi.fn(),
    logout: logoutMock,
    setToken: vi.fn(),
    setUser: vi.fn(),
  }),
}));

// API-клиент
vi.mock("../../api/client", () => ({
  api: { post: (...args) => postMock(...args) },
}));

// -------------------- Обычные импорты после моков --------------------
import "@testing-library/jest-dom";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Chat from "../Chat.jsx";

// Хелпер для рендера с роутером
function renderWithRouter(ui, { route = "/chat" } = {}) {
  return render(<MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>);
}

describe("Chat.jsx (Vitest)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    postMock.mockResolvedValue({ data: { reply: "Hello from AI" } });
  });

  it("renders input and Send button inside authenticated context", () => {
    renderWithRouter(<Chat />);
    // используем устойчивые роли, чтобы не зависеть от плейсхолдеров/текста
    expect(screen.getByRole("textbox")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send/i })).toBeInTheDocument();
  });

  it("types and clicks Send → calls API and shows bot reply", async () => {
    renderWithRouter(<Chat />);

    const input = screen.getByRole("textbox");
    const button = screen.getByRole("button", { name: /send/i });

    fireEvent.change(input, { target: { value: "1 + 2 =" } });
    fireEvent.click(button);

    await waitFor(() => expect(postMock).toHaveBeenCalledTimes(1));
    const [url, body] = postMock.mock.calls[0];
    expect(url).toBe("/api/chat");
    expect(body).toEqual({ message: "1 + 2 =" });

    // ответ от бота
    expect(await screen.findByText(/hello from ai/i)).toBeInTheDocument();
  });

  it("Enter (without Shift) sends the message", async () => {
    renderWithRouter(<Chat />);
    const input = screen.getByRole("textbox");

    fireEvent.change(input, { target: { value: "ping" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter", charCode: 13 });

    await waitFor(() => expect(postMock).toHaveBeenCalledTimes(1));
    const [, body] = postMock.mock.calls[0];
    expect(body).toEqual({ message: "ping" });
  });

  it("handles 401: logout + navigate('/login') and shows error message", async () => {
    postMock.mockRejectedValueOnce({
      response: { status: 401, data: "Unauthorized" },
      message: "Unauthorized",
    });

    renderWithRouter(<Chat />);
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "secret" } });

    // отправляем Enter (как у тебя было)
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    await waitFor(() => {
      expect(logoutMock).toHaveBeenCalledTimes(1);
      expect(navigateMock).toHaveBeenCalledWith("/login");
    });

    // устойчиво: ищем любой текст ошибки
    expect(
      await screen.findByText(/unauthorized|chat error|try again|error/i)
    ).toBeInTheDocument();
  });

  it("shows error message on non-401 failure (network etc.)", async () => {
    // 1) API падает не 401
    postMock.mockRejectedValueOnce(new Error("Network down"));

    renderWithRouter(<Chat />);

    // 2) Вводим сообщение
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "hi" } });

    // ✅ ВАЖНО: отправляем через кнопку, чтобы гарантировать submit
    const button = screen.getByRole("button", { name: /send/i });
    fireEvent.click(button);

    // 3) Убеждаемся, что запрос реально ушёл
    await waitFor(() => expect(postMock).toHaveBeenCalledTimes(1));

    // 4) Проверяем, что появляется какой-то текст ошибки (общий или конкретный)
    expect(
      await screen.findByText(
        /network down|chat error|please try again|try again|error/i
      )
    ).toBeInTheDocument();
  });
});


