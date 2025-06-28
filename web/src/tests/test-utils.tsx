/* eslint-disable react-refresh/only-export-components */
import React, { ReactElement } from "react";
import { render as rtlRender, RenderOptions } from "@testing-library/react";
import { Provider } from "react-redux";
import { store } from "@store/store";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { renderHook } from "@testing-library/react";
import { vi } from "vitest";
// Ajout React Query
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// ...existing code...

// Création d'un QueryClient unique partagé pour tous les tests
const queryClient = new QueryClient();

// ...existing code...

import type { SocketContextType } from "@contexts/SocketContext";
import type { Socket } from "socket.io-client";

const MockSocketContext = React.createContext<SocketContextType | undefined>(
  undefined
);

// ...existing code...

const MockSocketProvider = ({ children }: { children: React.ReactNode }) => {
  // Définition du contexte mocké pour les tests
  const mockSocketContext: SocketContextType = {
    socket: {
      id: "mock-socket-id",
      connected: true,
      on: vi.fn(),
      off: vi.fn(),
      emit: vi.fn(),
    } as unknown as Socket, // Cast to match the expected type
    isConnected: true,
  };

  return (
    <MockSocketContext.Provider value={mockSocketContext}>
      {children}
    </MockSocketContext.Provider>
  );
};

// ...existing code...

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
      <QueryClientProvider client={queryClient}>
        <MockSocketProvider>
          <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
        </MockSocketProvider>
      </QueryClientProvider>
    </Provider>
  );
  return renderHook(hook, { wrapper: Wrapper, ...options });
}

export const TestProvider = ({
  children,
  route = "/",
}: {
  children: React.ReactNode;
  route?: string;
}) => (
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <MockSocketProvider>
        <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
      </MockSocketProvider>
    </QueryClientProvider>
  </Provider>
);

function renderWithProviders(
  ui: ReactElement,
  {
    route = "/",
    storeOverride,
    ...renderOptions
  }: { route?: string; storeOverride?: typeof store } & RenderOptions = {}
) {
  const usedStore = storeOverride || store;
  return rtlRender(ui, {
    wrapper: ({ children }) => (
      <Provider store={usedStore}>
        <QueryClientProvider client={queryClient}>
          <MockSocketProvider>
            <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
          </MockSocketProvider>
        </QueryClientProvider>
      </Provider>
    ),
    ...renderOptions,
  });
}

function render(
  ui: ReactElement,
  {
    route = "/",
    storeOverride,
    ...renderOptions
  }: { route?: string; storeOverride?: typeof store } & RenderOptions = {}
) {
  const usedStore = storeOverride || store;
  return rtlRender(ui, {
    wrapper: ({ children }) => (
      <Provider store={usedStore}>
        <QueryClientProvider client={queryClient}>
          <MockSocketProvider>
            <MemoryRouter initialEntries={[route]}>
              <Routes>
                <Route
                  path="/workspaces/:workspaceId/channels/:channelId"
                  element={children}
                />
                <Route
                  path="/workspaces/:workspaceId/channels"
                  element={children}
                />
                <Route path="*" element={children} />
              </Routes>
            </MemoryRouter>
          </MockSocketProvider>
        </QueryClientProvider>
      </Provider>
    ),
    ...renderOptions,
  });
}

export * from "@testing-library/react";
export { render, renderWithProviders };
