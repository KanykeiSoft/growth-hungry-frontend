// src/components/__tests__/Chat.test.jsx
/// <reference types="vitest" />
/**
 * @vitest-environment jsdom
 */
import { vi, beforeEach, describe, it, expect } from "vitest";

// ---------- Моки ДОЛЖНЫ быть до импортов ----------

const navigateMock = vi.fn();
const logoutMock = vi.fn();

const fetchSectionChatMock = vi.fn();
const sendSectionMessageMock = vi.fn();

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

// ✅ Мокаем API для section chat
vi.mock("../../api/chat", () => ({
  fetchSectionChat: (...args) => fetchSectionChatMock(...args),
  sendSectionMessage: (...args) => sendSectionMessageMock(...args),
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

describe("Chat.jsx (Vitest) - section chat", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // по умолчанию: загрузка секции возвращает sessionId и пустые сообщения
    fetchSectionChatMock.mockResolvedValue({
      chatSessionId: 10,
      messages: [],
    });

    // по умолчанию: отправка сообщения возвращает reply
    sendSectionMessageMock.mockResolvedValue({
      reply: "Hello from AI",
      chatSessionId: 10,
    });
  });

  it("renders input and Send button", () => {
    renderWithRouter(<Chat sectionId={1} />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send/i })).toBeInTheDocument();
  });

  it("loads section chat on mount", async () => {
    renderWithRouter(<Chat sectionId={1} />);

    await waitFor(() => expect(fetchSectionChatMock).toHaveBeenCalledTimes(1));
    expect(fetchSectionChatMock).toHaveBeenCalledWith(1);
  });

  it("types and clicks Send → calls API and shows bot reply", async () => {
    renderWithRouter(<Chat sectionId={1} />);

    // дождаться загрузки истории (важно для стабильности)
    await waitFor(() => expect(fetchSectionChatMock).toHaveBeenCalledTimes(1));

    const input = screen.getByPlaceholderText(/type your message/i);
    const button = screen.getByRole("button", { name: /send/i });

    fireEvent.change(input, { target: { value: "1 + 2 =" } });
    fireEvent.click(button);

    await waitFor(() => expect(sendSectionMessageMock).toHaveBeenCalledTimes(1));

    // ✅ проверяем аргументы безопасно
    const [secId, text] = sendSectionMessageMock.mock.calls[0];
    expect(secId).toBe(1);
    expect(text).toBe("1 + 2 =");

    // ✅ бот-ответ должен появиться
    expect(await screen.findByText(/hello from ai/i)).toBeInTheDocument();
  });

  it("handles 401 on send: logout + navigate('/login') and shows error", async () => {
    // 401 на отправке
    sendSectionMessageMock.mockRejectedValueOnce({
      response: { status: 401, data: "Unauthorized" },
      message: "Unauthorized",
    });

    renderWithRouter(<Chat sectionId={1} />);

    await waitFor(() => expect(fetchSectionChatMock).toHaveBeenCalledTimes(1));

    const input = screen.getByPlaceholderText(/type your message/i);
    fireEvent.change(input, { target: { value: "secret" } });

    // ✅ у тебя отправка только через submit/click, не через onKeyDown
    fireEvent.click(screen.getByRole("button", { name: /send/i }));

    await waitFor(() => expect(sendSectionMessageMock).toHaveBeenCalledTimes(1));

    await waitFor(() => {
      expect(logoutMock).toHaveBeenCalledTimes(1);
      expect(navigateMock).toHaveBeenCalledWith("/login");
    });

    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });

  it("handles 401 on initial load: logout + navigate('/login') and shows error", async () => {
    fetchSectionChatMock.mockRejectedValueOnce({
      response: { status: 401, data: "Unauthorized" },
      message: "Unauthorized",
    });

    renderWithRouter(<Chat sectionId={1} />);

    await waitFor(() => {
      expect(logoutMock).toHaveBeenCalledTimes(1);
      expect(navigateMock).toHaveBeenCalledWith("/login");
    });

    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });

  it("shows error message on non-401 failure (network etc.)", async () => {
    sendSectionMessageMock.mockRejectedValueOnce(new Error("Network down"));

    renderWithRouter(<Chat sectionId={1} />);

    await waitFor(() => expect(fetchSectionChatMock).toHaveBeenCalledTimes(1));

    const input = screen.getByPlaceholderText(/type your message/i);
    fireEvent.change(input, { target: { value: "hi" } });

    fireEvent.click(screen.getByRole("button", { name: /send/i }));

    await waitFor(() => expect(sendSectionMessageMock).toHaveBeenCalledTimes(1));

    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });

  it("disables input and button if sectionId is missing", () => {
    renderWithRouter(<Chat sectionId={null} />);

    const input = screen.getByRole("textbox");
    expect(input).toBeDisabled();

    const button = screen.getByRole("button", { name: /send/i });
    expect(button).toBeDisabled();
  });
});
