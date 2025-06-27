/* eslint-disable react-refresh/only-export-components */
import React, { ReactElement } from "react";
import { render as rtlRender, RenderOptions } from "@testing-library/react";
import { Provider } from "react-redux";
import { store } from "@store/store";
import { MemoryRouter } from "react-router-dom";
import { renderHook } from "@testing-library/react";
import { vi } from "vitest";

// Import relatif pour éviter les problèmes d'alias dans les tests
interface MockSocket {
  on: (event: string, listener: (...args: unknown[]) => void) => void;
  off: (event: string, listener?: (...args: unknown[]) => void) => void;
  emit: (...args: unknown[]) => void;
  connect: () => void;
  disconnect: () => void;
  connected: boolean;
  id?: string;
  io?: object;
}

interface SocketContextType {
  socket: MockSocket;
  isConnected: boolean;
}

// Mock SocketContext
const MockSocketContext = React.createContext<SocketContextType | undefined>(
  undefined
);

// Mock SocketProvider pour les tests - simule le contexte Socket réel
const MockSocketProvider = ({ children }: { children: React.ReactNode }) => {
  const mockSocket = {
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
    connect: vi.fn(),
    disconnect: vi.fn(),
    connected: true,
    id: "test-socket-id",
    io: {},
  };

  const mockSocketContext: SocketContextType = {
    socket: mockSocket,
    isConnected: true,
  };

  return (
    <MockSocketContext.Provider value={mockSocketContext}>
      {children}
    </MockSocketContext.Provider>
  );
};

// Mock du socket pour les tests
vi.mock("socket.io-client", () => ({
  io: vi.fn(() => ({
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
    connect: vi.fn(),
    disconnect: vi.fn(),
    connected: true,
  })),
}));

// Mock du hook useSocket
vi.mock("@hooks/useSocket", () => ({
  useSocket: () => ({
    socket: {
      on: vi.fn(),
      off: vi.fn(),
      emit: vi.fn(),
      connect: vi.fn(),
      disconnect: vi.fn(),
      connected: true,
    },
    isConnected: true,
  }),
}));

/**
 * Helper pour tester les hooks avec tous les providers globaux (Redux, Router, etc.)
 * Permet de passer un store custom si besoin (ex: pour les tests de slice)
 */
export function renderHookWithProviders<T>(
  hook: () => T,
  {
    storeOverride,
    route = "/",
    ...options
  }: { storeOverride?: typeof store; route?: string } = {}
) {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={storeOverride || store}>
      <MockSocketProvider>
        <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
      </MockSocketProvider>
    </Provider>
  );
  return renderHook(hook, { wrapper: Wrapper, ...options });
}

// Fournit tous les providers globaux pour les tests (Redux, Router, Socket, etc.)
export const TestProvider = ({
  children,
  route = "/",
}: {
  children: React.ReactNode;
  route?: string;
}) => (
  <Provider store={store}>
    <MockSocketProvider>
      <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
    </MockSocketProvider>
  </Provider>
);

// Permet d'utiliser le store Redux typé et le router dans tous les tests
function render(
  ui: ReactElement,
  {
    route = "/",
    storeOverride,
    ...renderOptions
  }: { route?: string; storeOverride?: typeof store } & RenderOptions = {}
) {
  // Si un store custom est fourni, l'utiliser, sinon store par défaut
  const usedStore = storeOverride || store;
  return rtlRender(ui, {
    wrapper: ({ children }) => (
      <Provider store={usedStore}>
        <MockSocketProvider>
          <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
        </MockSocketProvider>
      </Provider>
    ),
    ...renderOptions,
  });
}

// Réexporte tout pour compatibilité avec règles Fast Refresh
export * from "@testing-library/react";

// Fonction render personnalisée avec providers
export { render };
