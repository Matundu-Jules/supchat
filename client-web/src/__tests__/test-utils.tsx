import React, { ReactElement } from "react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import { render, RenderOptions } from "@testing-library/react";

// Créer un store de test minimal
const createTestStore = () => {
  return configureStore({
    reducer: {
      auth: (state = { user: null, token: null }) => state,
      workspaces: (
        state = { items: [], current: null, loading: false, error: null }
      ) => state,
      channels: (state = { current: null, list: [] }) => state,
      messages: (state = { list: [] }) => state,
      notifications: (state = { list: [], unread: 0 }) => state,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
  });
};

// Provider wrapper pour les tests
const TestProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const store = createTestStore();

  return (
    <Provider store={store}>
      <BrowserRouter>{children}</BrowserRouter>
    </Provider>
  );
};

// Wrapper personnalisé pour render avec providers
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) => render(ui, { wrapper: TestProvider, ...options });

export * from "@testing-library/react";
export { customRender as render };
export { TestProvider };
