// src/components/__tests__/Chat.test.jsx
/// <reference types="vitest" />
/**
 * @vitest-environment jsdom
 */
import { vi, beforeEach, describe, it, expect } from "vitest";

// --------- Моки ДОЛЖНЫ идти раньше любых импортов модуля/React/RTL ---------

// Спаи/моки, которые нужны фабрикам ниже
const navigateMock = vi.fn();
const logoutMock = vi.fn();
const postMock = vi.fn();

// react-router-dom: подменяем только useNavigate, остальное берём из реального модуля
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigateMock,
    MemoryRouter: actual.MemoryRouter,
  };
});

// AuthContext: возвращаем useAuth и тестовый провайдер
vi.mock("../../auth/AuthContext.jsx", async () => {
  const React = await import("react");
  const Ctx = React.createContext(null);
  const useAuth = () => React.useContext(Ctx);
  const AuthProviderMock = ({ children, token = "test-token" }) =>
    React.createElement(
      Ctx.Provider,
      { value: { token, logout: logoutMock } },
      children
    );
  return { useAuth, AuthProviderMock };
});

// API-клиент
vi.mock("../../api/client", () => ({
  api: { post: (...args) => postMock(...args) },
}));

// --------- Теперь обычные импорты ---------
import React from "react";
import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Chat from "../Chat.jsx";
import { MemoryRouter } from "react-router-dom";
import { AuthProviderMock } from "../../auth/AuthContext.jsx";

// Хелпер для рендера с провайдерами
function renderWithProviders(ui, { route = "/" } = {}) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <AuthProviderMock>{ui}</AuthProviderMock>
    </MemoryRouter>
  );
}

describe("Chat.jsx (Vitest)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    postMock.mockResolvedValue({ data: { reply: "Hello from AI" } });
  });

  it("renders input and Send button inside authenticated context", () => {
    renderWithProviders(<Chat />);
    expect(screen.getByPlaceholderText(/write message/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send/i })).toBeInTheDocument();
    expect(screen.getByText(/hi, ask me/i)).toBeInTheDocument();
  });

  it("types and clicks Send -> calls API and shows bot reply", async () => {
    renderWithProviders(<Chat />);

    const input = screen.getByPlaceholderText(/write message/i);
    const button = screen.getByRole("button", { name: /send/i });

    fireEvent.change(input, { target: { value: "1 + 2 =" } });
    fireEvent.click(button);

    expect(screen.getByText("1 + 2 =")).toBeInTheDocument();

    await waitFor(() => expect(postMock).toHaveBeenCalledTimes(1));
    const [url, body, config] = postMock.mock.calls[0];
    expect(url).toBe("/api/chat");
    expect(body).toEqual({ message: "1 + 2 =" });

    // Заголовок Authorization обычно добавляет интерсептор — config может быть undefined.
    if (config?.headers?.Authorization) {
      expect(config.headers.Authorization).toMatch(/^Bearer\s+/);
    }

    expect(await screen.findByText("Hello from AI")).toBeInTheDocument();
  });

  it("Enter (without Shift) sends the message", async () => {
    renderWithProviders(<Chat />);
    const input = screen.getByPlaceholderText(/write message/i);

    fireEvent.change(input, { target: { value: "ping" } });
    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() => expect(postMock).toHaveBeenCalledTimes(1));
    const [, body] = postMock.mock.calls[0];
    expect(body).toEqual({ message: "ping" });
  });

  it("handles 401: logout + navigate('/login') and shows system error bubble", async () => {
    postMock.mockRejectedValueOnce({
      response: { status: 401, data: "Unauthorized" },
      message: "Unauthorized",
    });

    renderWithProviders(<Chat />);

    const input = screen.getByPlaceholderText(/write message/i);
    fireEvent.change(input, { target: { value: "secret" } });
    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() => {
      expect(logoutMock).toHaveBeenCalledTimes(1);
      expect(navigateMock).toHaveBeenCalledWith("/login");
    });

    expect(
      screen.getByText(/chat error\. please try again later\./i)
    ).toBeInTheDocument();
  });

  it("shows error bubble on non-401 failure", async () => {
    postMock.mockRejectedValueOnce(new Error("Network down"));

    renderWithProviders(<Chat />);

    const input = screen.getByPlaceholderText(/write message/i);
    fireEvent.change(input, { target: { value: "hi" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(await screen.findByText(/chat error/i)).toBeInTheDocument();
  });
});

