import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import messagesReducer from "@store/messagesSlice";
import { useMessages } from "@hooks/useMessages";

// Provider de test Redux avec un état initial contrôlé
const createTestStore = (customState = {}) =>
  configureStore({
    reducer: { messages: messagesReducer },
    preloadedState: {
      messages: {
        items: [],
        loading: false,
        error: null,
        ...customState,
      },
    },
  });

const CustomTestProvider = ({
  children,
  state,
}: {
  children: React.ReactNode;
  state?: any;
}) => <Provider store={createTestStore(state)}>{children}</Provider>;

// Composant de test simple qui utilise useMessages
const MessagesList = ({ channelId }: { channelId: string }) => {
  const { messages, loading, error, send } = useMessages(channelId);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const input = form.elements.namedItem("message") as HTMLInputElement;
    if (input.value.trim()) {
      send(input.value);
      input.value = "";
    }
  };

  if (loading) return <div data-testid="loading">Chargement...</div>;
  if (error) return <div data-testid="error">Erreur: {error}</div>;

  return (
    <div data-testid="messages-list">
      <div data-testid="messages">
        {messages.map((msg: any) => (
          <div key={msg._id} data-testid="message">
            <span data-testid="author">{msg.author?.name || "Anonyme"}</span>:
            <span data-testid="text">{msg.text}</span>
          </div>
        ))}
      </div>
      <form onSubmit={handleSendMessage} data-testid="message-form">
        <input
          name="message"
          data-testid="message-input"
          placeholder="Tapez votre message..."
        />
        <button type="submit" data-testid="send-button">
          Envoyer
        </button>
      </form>
    </div>
  );
};

// Mock du hook useSocket
const mockSocket = {
  on: vi.fn(),
  off: vi.fn(),
  emit: vi.fn(),
  connected: true,
};

vi.mock("../../hooks/useSocket", () => ({
  useSocket: () => ({
    socket: mockSocket,
    isConnected: true,
  }),
}));

// Mock du thunk fetchMessages pour éviter le loading infini
vi.mock("@store/messagesSlice", async () => {
  const actual = await import("@store/messagesSlice");
  return {
    ...actual,
    fetchMessages: () => async (dispatch: any) => {
      // Simule un succès immédiat
      dispatch({ type: "messages/fetchMessages/pending" });
      dispatch({
        type: "messages/fetchMessages/fulfilled",
        payload: [],
      });
    },
  };
});

describe("MessagesList Component - Integration Test", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render loading state initially", () => {
    render(
      <CustomTestProvider state={{ loading: true }}>
        <MessagesList channelId="channel-123" />
      </CustomTestProvider>
    );
    expect(screen.getByTestId("loading")).toBeInTheDocument();
  });

  it("should render empty message list", async () => {
    render(
      <CustomTestProvider>
        <MessagesList channelId="channel-123" />
      </CustomTestProvider>
    );
    await waitFor(() => {
      expect(screen.getByTestId("messages")).toBeInTheDocument();
    });
    expect(screen.getByTestId("message-form")).toBeInTheDocument();
    expect(screen.getByTestId("message-input")).toBeInTheDocument();
    expect(screen.getByTestId("send-button")).toBeInTheDocument();
  });

  it("should handle form submission", async () => {
    render(
      <CustomTestProvider>
        <MessagesList channelId="channel-123" />
      </CustomTestProvider>
    );
    await waitFor(() => {
      expect(screen.getByTestId("message-input")).toBeInTheDocument();
    });
    const input = screen.getByTestId("message-input");
    const form = screen.getByTestId("message-form");
    fireEvent.change(input, { target: { value: "Hello World" } });
    expect(input).toHaveValue("Hello World");
    fireEvent.submit(form);
    expect(input).toHaveValue("");
  });

  it("should not submit empty messages", async () => {
    render(
      <CustomTestProvider>
        <MessagesList channelId="channel-123" />
      </CustomTestProvider>
    );
    await waitFor(() => {
      expect(screen.getByTestId("message-input")).toBeInTheDocument();
    });
    const input = screen.getByTestId("message-input");
    const form = screen.getByTestId("message-form");
    fireEvent.change(input, { target: { value: "   " } });
    fireEvent.submit(form);
    expect(input).toHaveValue("   ");
  });

  it("should initialize socket listeners", () => {
    render(
      <CustomTestProvider>
        <MessagesList channelId="channel-123" />
      </CustomTestProvider>
    );
    expect(mockSocket.on).toHaveBeenCalledWith(
      "new-message",
      expect.any(Function)
    );
    expect(mockSocket.on).toHaveBeenCalledWith(
      "message-updated",
      expect.any(Function)
    );
    expect(mockSocket.on).toHaveBeenCalledWith(
      "message-deleted",
      expect.any(Function)
    );
    expect(mockSocket.on).toHaveBeenCalledWith(
      "message-sent",
      expect.any(Function)
    );
  });

  it("should handle channel change", () => {
    const { rerender } = render(
      <CustomTestProvider>
        <MessagesList channelId="channel-123" />
      </CustomTestProvider>
    );
    rerender(
      <CustomTestProvider>
        <MessagesList channelId="channel-456" />
      </CustomTestProvider>
    );
    expect(mockSocket.on).toHaveBeenCalled();
  });
});
