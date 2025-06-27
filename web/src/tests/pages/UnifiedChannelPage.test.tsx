import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import ChannelsPage from "@pages/channels/ChannelsPage";

// Mock des hooks personnalisés
vi.mock("@hooks/useChannelNavigation", () => ({
  useChannelNavigation: () => ({
    workspaceId: "test-workspace-id",
    activeChannelId: "",
    selectChannel: vi.fn(),
    clearChannel: vi.fn(),
  }),
}));

vi.mock("@hooks/useRightPanel", () => ({
  useRightPanel: () => ({
    rightPanelView: null,
    isOpen: false,
    openPanel: vi.fn(),
    closePanel: vi.fn(),
    togglePanel: vi.fn(),
  }),
}));

vi.mock("@hooks/useChannels", () => ({
  useChannels: () => ({
    channels: [],
    loading: false,
    fetchChannels: vi.fn(),
    handleCreateChannel: vi.fn(),
  }),
}));

vi.mock("@hooks/useMessages", () => ({
  useMessages: () => ({
    messages: [],
    loading: false,
    send: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    error: null,
  }),
}));

vi.mock("@hooks/useChannelDetails", () => ({
  useChannelDetails: () => ({
    channel: null,
    loading: false,
    handleUpdate: vi.fn(),
    handleDelete: vi.fn(),
    updating: false,
    updateError: null,
  }),
}));

vi.mock("@hooks/useChannelPermissions", () => ({
  useChannelPermissions: () => ({
    canEdit: false,
    canManageMembers: false,
  }),
}));

vi.mock("@hooks/useChannelMembers", () => ({
  useChannelMembers: () => ({
    invite: vi.fn(),
    remove: vi.fn(),
    loading: false,
    error: null,
    success: false,
  }),
}));

vi.mock("@services/workspaceApi", () => ({
  getWorkspaceUsers: vi.fn().mockResolvedValue([]),
  getWorkspaceMembers: vi.fn().mockResolvedValue([]),
}));

// Store de test
const createTestStore = () => {
  return configureStore({
    reducer: {
      auth: (
        state = {
          user: { id: "test-user", email: "test@example.com", role: "member" },
        }
      ) => state,
    },
  });
};

const renderWithProviders = (component: React.ReactElement) => {
  const store = createTestStore();
  return render(
    <Provider store={store}>
      <BrowserRouter>{component}</BrowserRouter>
    </Provider>
  );
};

describe("ChannelsPage", () => {
  it("should render without crashing", () => {
    renderWithProviders(<ChannelsPage />);
    expect(screen.getByText("Canaux")).toBeInTheDocument();
  });

  it("should display empty state when no channel is selected", () => {
    renderWithProviders(<ChannelsPage />);
    expect(screen.getByText("Bienvenue dans les canaux")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Sélectionnez un canal dans la liste pour commencer à discuter"
      )
    ).toBeInTheDocument();
  });
});
