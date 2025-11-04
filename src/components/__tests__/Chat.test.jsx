// src/components/__tests__/Chat.test.jsx
/// <reference types="vitest" />
/**
 * @vitest-environment jsdom
 */
import { vi, beforeEach, describe, it, expect } from "vitest";

// ---------- Моки ДОЛЖНЫ быть до любых импортов тестируемых модулей ----------

// Общие спаи
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

  it("handles 401: logout + navigate('/login') and shows system error bubble", async () => {
    postMock.mockRejectedValueOnce({
      response: { status: 401, data: "Unauthorized" },
      message: "Unauthorized",
    });

    renderWithRouter(<Chat />);
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "secret" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    await waitFor(() => {
      expect(logoutMock).toHaveBeenCalledTimes(1);
      expect(navigateMock).toHaveBeenCalledWith("/login");
    });

    // универсальный матч на пузырь с ошибкой
    expect(
      await screen.findByText(/chat error|try again|error/i)
    ).toBeInTheDocument();
  });

// src/components/__tests__/Chat.test.jsx

it("shows error bubble on non-401 failure", async () => {
    // 1) API падает не 401
    postMock.mockRejectedValueOnce(new Error("Network down"));
  
    renderWithRouter(<Chat />);
  
    // 2) Отправляем сообщение
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "hi" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });
  
    // 3) Проверяем ИМЕННО системный пузырь (по data-testid)
    const bubble = await screen.findByTestId("error-bubble");
    expect(bubble).toBeInTheDocument();
    expect(bubble).toHaveTextContent(/chat error\. please try again later\./i);
  
    // 4) И отдельно — сырой текст ошибки
    expect(await screen.findByText(/network down/i)).toBeInTheDocument();
  });
  
});

