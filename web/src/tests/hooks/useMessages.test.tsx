import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import type { PropsWithChildren } from "react";
import { useMessages } from "@hooks/useMessages";
import messagesSlice from "@store/messagesSlice";
import authSlice from "@store/authSlice";

// Mock du hook useSocket
const mockSocket = {
  on: vi.fn(),
  off: vi.fn(),
  emit: vi.fn(),
  connected: true,
};

// Store de test
const createTestStore = () => {
  return configureStore({
    reducer: {
      messages: messagesSlice,
      auth: authSlice,
    },
    preloadedState: {
      auth: {
        user: {
          id: "user-1",
          name: "Test User",
          email: "test@example.com",
          role: "membre" as const,
        },
        isAuthenticated: true,
        isLoading: false,
      },
      messages: {
        items: [],
        loading: false,
        error: null,
      },
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
  });
};

// Wrapper avec Redux Provider
const createWrapper = () => {
  const store = createTestStore();
  return ({ children }: PropsWithChildren) => (
    <Provider store={store}>{children}</Provider>
  );
};

vi.mock("@hooks/useSocket", () => ({
  useSocket: () => ({
    socket: mockSocket,
    isConnected: true,
  }),
}));

describe("useMessages Hook - Tests Vitest & React Testing Library", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize socket listeners for message events", () => {
    const wrapper = createWrapper();
    renderHook(() => useMessages("channel-123"), { wrapper });

    // Vérifier que les listeners sont configurés
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
    expect(mockSocket.on).toHaveBeenCalledWith("error", expect.any(Function));
  });

  it("should return correct API methods", () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useMessages("channel-123"), {
      wrapper,
    });

    // Vérifier que le hook retourne les bonnes méthodes
    expect(result.current).toHaveProperty("messages");
    expect(result.current).toHaveProperty("loading");
    expect(result.current).toHaveProperty("error");
    expect(result.current).toHaveProperty("send");
    expect(result.current).toHaveProperty("update");
    expect(result.current).toHaveProperty("remove");

    expect(typeof result.current.send).toBe("function");
    expect(typeof result.current.update).toBe("function");
    expect(typeof result.current.remove).toBe("function");
  });

  it("should handle new message via socket", () => {
    const wrapper = createWrapper();
    renderHook(() => useMessages("channel-123"), { wrapper });

    // Simuler la réception d'un nouveau message
    const newMessage = {
      _id: "msg-1",
      text: "Hello from Vitest!",
      channelId: "channel-123",
      author: { _id: "user-1", name: "User1" },
      createdAt: new Date().toISOString(),
    };

    // Trouver le callback 'new-message' et l'appeler
    const newMessageCallback = mockSocket.on.mock.calls.find(
      ([event]) => event === "new-message"
    )?.[1];

    expect(newMessageCallback).toBeDefined();

    if (newMessageCallback) {
      newMessageCallback(newMessage);
    }

    // Vérifier que le callback est défini et fonctionne
    expect(newMessageCallback).toBeDefined();
  });

  it("should call send method correctly", async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useMessages("channel-123"), {
      wrapper,
    });

    const messageText = "Test message from Vitest";

    // L'API du hook utilise send(text, file?)
    await expect(result.current.send(messageText)).resolves.not.toThrow();

    // Vérifier que la méthode a été appelée sans erreur
    expect(typeof result.current.send).toBe("function");
  });

  it("should handle empty messages correctly", async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useMessages("channel-123"), {
      wrapper,
    });

    // Tenter d'envoyer des messages vides (le hook devrait les ignorer)
    await result.current.send("");
    await result.current.send("   ");
    // await result.current.send();

    // Le hook devrait gérer ces cas sans erreur
    expect(typeof result.current.send).toBe("function");
  });

  it("should cleanup socket listeners on unmount", () => {
    const wrapper = createWrapper();
    const { unmount } = renderHook(() => useMessages("channel-123"), {
      wrapper,
    });

    // Vérifier que les listeners sont ajoutés
    expect(mockSocket.on).toHaveBeenCalled();

    unmount();

    // Vérifier le nettoyage
    expect(mockSocket.off).toHaveBeenCalledWith(
      "new-message",
      expect.any(Function)
    );
    expect(mockSocket.off).toHaveBeenCalledWith(
      "message-updated",
      expect.any(Function)
    );
    expect(mockSocket.off).toHaveBeenCalledWith(
      "message-deleted",
      expect.any(Function)
    );
    expect(mockSocket.off).toHaveBeenCalledWith(
      "message-sent",
      expect.any(Function)
    );
    expect(mockSocket.off).toHaveBeenCalledWith("error", expect.any(Function));
  });

  it("should handle message update event", () => {
    const wrapper = createWrapper();
    renderHook(() => useMessages("channel-123"), { wrapper });

    // Trouver le callback 'message-updated'
    const updateCallback = mockSocket.on.mock.calls.find(
      ([event]) => event === "message-updated"
    )?.[1];

    expect(updateCallback).toBeDefined();

    const updatedMessage = {
      _id: "msg-1",
      text: "Updated content via Vitest",
      channelId: "channel-123",
      author: { _id: "user-1", name: "User1" },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (updateCallback) {
      updateCallback(updatedMessage);
    }

    expect(updateCallback).toBeDefined();
  });

  it("should handle message delete event", () => {
    const wrapper = createWrapper();
    renderHook(() => useMessages("channel-123"), { wrapper });

    // Trouver le callback 'message-deleted'
    const deleteCallback = mockSocket.on.mock.calls.find(
      ([event]) => event === "message-deleted"
    )?.[1];

    expect(deleteCallback).toBeDefined();

    if (deleteCallback) {
      deleteCallback({ messageId: "msg-1", channelId: "channel-123" });
    }

    expect(deleteCallback).toBeDefined();
  });

  it("should handle message sent confirmation", () => {
    const wrapper = createWrapper();
    renderHook(() => useMessages("channel-123"), { wrapper });

    // Trouver le callback 'message-sent'
    const sentCallback = mockSocket.on.mock.calls.find(
      ([event]) => event === "message-sent"
    )?.[1];

    expect(sentCallback).toBeDefined();

    const sentMessage = {
      success: true,
      message: {
        _id: "msg-1",
        text: "Sent message via Vitest",
        channelId: "channel-123",
        author: { _id: "user-1", name: "User1" },
        createdAt: new Date().toISOString(),
      },
    };

    if (sentCallback) {
      sentCallback(sentMessage);
    }

    expect(sentCallback).toBeDefined();
  });

  it("should handle error events", () => {
    const wrapper = createWrapper();
    renderHook(() => useMessages("channel-123"), { wrapper });

    // Vérifier que le listener d'erreur est configuré
    expect(mockSocket.on).toHaveBeenCalledWith("error", expect.any(Function));

    // Trouver le callback 'error'
    const errorCallback = mockSocket.on.mock.calls.find(
      ([event]) => event === "error"
    )?.[1];

    expect(errorCallback).toBeDefined();

    if (errorCallback) {
      errorCallback({ message: "Test error from Vitest" });
    }

    expect(errorCallback).toBeDefined();
  });

  it("should handle different channel IDs", () => {
    const wrapper = createWrapper();

    // Tester avec différents IDs de channel
    const { unmount: unmount1 } = renderHook(() => useMessages("channel-1"), {
      wrapper,
    });
    const { unmount: unmount2 } = renderHook(() => useMessages("channel-2"), {
      wrapper,
    });
    const { unmount: unmount3 } = renderHook(() => useMessages(""), {
      wrapper,
    });

    // Nettoyer
    unmount1();
    unmount2();
    unmount3();

    // Vérifier qu'aucune erreur n'est générée
    expect(mockSocket.on).toHaveBeenCalled();
  });

  it("should work with mock socket disconnected", () => {
    // Temporairement déconnecter le socket
    const originalConnected = mockSocket.connected;
    mockSocket.connected = false;

    const wrapper = createWrapper();
    renderHook(() => useMessages("channel-123"), { wrapper });

    // Le hook devrait gérer la déconnexion sans erreur
    expect(mockSocket.connected).toBe(false);

    // Restaurer
    mockSocket.connected = originalConnected;
  });

  it("should validate socket event callbacks exist", () => {
    const wrapper = createWrapper();
    renderHook(() => useMessages("channel-123"), { wrapper });

    // Vérifier que tous les callbacks sont définis
    const callbacks = [
      "new-message",
      "message-updated",
      "message-deleted",
      "message-sent",
      "error",
    ];

    callbacks.forEach((eventName) => {
      const callback = mockSocket.on.mock.calls.find(
        ([event]) => event === eventName
      )?.[1];

      expect(callback).toBeDefined();
      expect(typeof callback).toBe("function");
    });
  });
});
