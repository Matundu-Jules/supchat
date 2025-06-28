import { render } from "@tests/test-utils";
import { configureStore } from "@reduxjs/toolkit";
import ChannelsPage from "@pages/channels/ChannelsPage";
import { screen } from "@testing-library/react";
import authReducer, { type Role } from "@store/authSlice";
import workspacesReducer from "@store/workspacesSlice";
import channelsReducer from "@store/channelsSlice";
import messagesReducer from "@store/messagesSlice";
import notificationsReducer from "@store/notificationsSlice";
import preferencesReducer from "@store/preferencesSlice";
import reactionsReducer from "@store/reactionsSlice";
import notificationPrefReducer from "@store/notificationPrefSlice";
import channelInvitationsReducer from "@store/channelInvitationsSlice";
import channelJoinRequestsReducer from "@store/channelJoinRequestsSlice";
import channelRolesReducer from "@store/channelRolesSlice";
import { channels } from "@tests/fixtures/channels";

const baseState = {
  workspaces: { items: [], joinRequests: [], loading: false, error: null },
  channels: {
    items: channels.map((c) => ({ ...c, type: c.type as "public" | "private" | "direct" })),
    loading: false,
    error: null,
    statusById: {},
  },
  messages: { items: [], loading: false, error: null },
  notifications: { items: [], loading: false, unread: 0, error: null },
  preferences: { theme: "light", status: "online", isLoaded: false, currentUserId: null },
  reactions: { items: [], loading: false, error: null },
  notificationPrefs: { items: [] },
  channelInvitations: { items: [], loading: false, error: null, statusById: {} },
  channelJoinRequests: { items: [], loading: false, error: null, statusById: {} },
  channelRoles: { items: [], loading: false, error: null, statusById: {} },
};

const createStore = (role: Role) =>
  configureStore({
    reducer: {
      auth: authReducer,
      workspaces: workspacesReducer,
      channels: channelsReducer,
      messages: messagesReducer,
      notifications: notificationsReducer,
      preferences: preferencesReducer,
      reactions: reactionsReducer,
      notificationPrefs: notificationPrefReducer,
      channelInvitations: channelInvitationsReducer,
      channelJoinRequests: channelJoinRequestsReducer,
      channelRoles: channelRolesReducer,
    },
    preloadedState: {
      ...baseState,
      auth: {
        user: { id: "u-test", email: "test@example.com", role },
        isAuthenticated: true,
        isLoading: false,
      },
    },
  });

describe("ChannelsPage - UI conditionnelle selon permissions", () => {
  test("N’affiche pas les boutons d’action pour un utilisateur sans droits", async () => {
    const store = createStore("invité");
    render(<ChannelsPage />, {
      storeOverride: store,
      route: "/workspaces/ws1/channels/ch1",
    });
    expect(screen.queryByRole("button", { name: /inviter/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /promouvoir/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /supprimer/i })).not.toBeInTheDocument();
  });

  test("Affiche les boutons d’action uniquement pour les admins/modérateurs", async () => {
    const store = createStore("admin");
    render(<ChannelsPage />, {
      storeOverride: store,
      route: "/workspaces/ws1/channels/ch1",
    });
    expect(await screen.findByRole("button", { name: /inviter/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /promouvoir/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /supprimer/i })).toBeInTheDocument();
  });
});
