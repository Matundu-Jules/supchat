import { render } from "@tests/test-utils";
import { server } from "@tests/mocks/server";
import { http, HttpResponse } from "msw";
import ChannelsPage from "@pages/channels/ChannelsPage";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@store/authSlice";
import channelsReducer from "@store/channelsSlice";
import channelJoinRequestsReducer from "@store/channelJoinRequestsSlice";
import { Provider } from "react-redux";
import { users } from "@tests/fixtures/users";
import type { Role } from "@store/authSlice";
import type { Theme, Status } from "@utils/userPreferences";

// Types fallback stricts supprimés (plus nécessaires avec http/HttpResponse MSW v2)

// Mocks et fixtures
import { joinRequests, channels } from "@tests/fixtures/channels";

// MSW handlers pour join requests
beforeEach(() => {
  server.use(
    http.get("/api/channels", () => {
      return HttpResponse.json({ channels });
    }),
    http.get("/api/channels/join-requests", () => {
      return HttpResponse.json(joinRequests);
    }),
    // Handler POST pour accepter une join request
    http.post(/channel-join-requests\/.+\/accept$/, async ({ params }) => {
      const requestId = params["requestId"] as string;
      const jr = joinRequests.find((j) => j._id === requestId);
      if (!jr)
        return HttpResponse.json({ error: "Not found" }, { status: 404 });
      return HttpResponse.json({
        joinRequest: { ...jr, status: "accepted" },
      });
    }),
    // Handler POST pour refuser une join request
    http.post(/channel-join-requests\/.+\/decline$/, async ({ params }) => {
      const requestId = params["requestId"] as string;
      const jr = joinRequests.find((j) => j._id === requestId);
      if (!jr)
        return HttpResponse.json({ error: "Not found" }, { status: 404 });
      return HttpResponse.json({
        joinRequest: { ...jr, status: "declined" },
      });
    }),
    // Handler POST pour envoyer une demande d’adhésion
    http.post(/channels\/.+\/join-request$/, async ({ params }) => {
      const channelId = params["id"] as string;
      // On simule la création d’une joinRequest
      return HttpResponse.json(
        {
          joinRequest: {
            _id: "jr_new",
            channelId,
            userId: "user1",
            status: "pending",
            requestedAt: new Date().toISOString(),
          },
        },
        { status: 201 }
      );
    }),
    // Ajout handler pour la route workspaces/*/channels
    http.get(/\/workspaces\/[^/]+\/channels$/, () => {
      return HttpResponse.json({ channels });
    }),
    // Ajout handler pour la route channel-join-requests (tous patterns)
    http.get(/channel-join-requests$/, () => {
      return HttpResponse.json({ joinRequests });
    }),
    // Handlers spécifiques au channel sélectionné
    http.get(/\/api\/channels\/([^/]+)$/, ({ params, request }) => {
      const channelId = request.url.split("/").pop();
      const channel = channels.find((c) => c._id === channelId);
      if (!channel)
        return HttpResponse.json({ error: "Not found" }, { status: 404 });
      return HttpResponse.json(channel);
    }),
    http.get(
      /\/api\/channels\/([^/]+)\/join-requests$/,
      ({ params, request }) => {
        const channelId = request.url.split("/")[5];
        const filtered = joinRequests.filter(
          (jr) => jr.channelId === channelId
        );
        return HttpResponse.json(filtered);
      }
    ),
    http.get(/\/api\/channels\/([^/]+)\/roles$/, ({ params, request }) => {
      // Simule un admin pour le user courant
      return HttpResponse.json([{ userId: users[0]._id, role: "admin" }]);
    }),
    http.get(/\/api\/messages\/channel\/([^/]+)$/, ({ params, request }) => {
      // Simule aucun message pour simplifier
      return HttpResponse.json([]);
    }),
    // Handler pour les permissions du workspace (évite l’erreur permissions.find)
    http.get("/api/permissions", ({ request }) => {
      const url = new URL(request.url);
      if (url.searchParams.get("workspaceId") === "ws1") {
        return HttpResponse.json([
          {
            _id: "perm1",
            userId: { _id: "user1" },
            workspaceId: "ws1",
            role: "admin",
            permissions: ["manage_channels", "invite_members"],
          },
          {
            _id: "perm2",
            userId: { _id: "user2" },
            workspaceId: "ws1",
            role: "member",
            permissions: ["view_channels"],
          },
        ]);
      }
      return HttpResponse.json([]);
    }),
    // Handler pour les membres du workspace
    http.get("/api/workspaces/ws1/members", () => {
      return HttpResponse.json([
        { _id: "user1", username: "Alice", role: "admin" },
        { _id: "user2", username: "Bob", role: "member" },
      ]);
    })
  );
});

// Préparation du preloadedState strict SUPCHAT
const mappedUser = { ...users[0], id: users[0]._id, role: "admin" as Role };
const preloadedState = {
  auth: {
    user: mappedUser, // admin connecté avec id et role typé
    isAuthenticated: true,
    isLoading: false,
  },
  workspaces: { items: [], joinRequests: [], loading: false, error: null },
  channels: {
    items: channels.map((c) => ({
      ...c,
      type: c.type as "public" | "private" | "direct",
    })),
    loading: false,
    error: null,
    statusById: {},
  },
  messages: { items: [], loading: false, error: null },
  notifications: { items: [], loading: false, unread: 0, error: null },
  preferences: {
    theme: "light" as Theme,
    status: "online" as Status,
    isLoaded: false,
    currentUserId: null,
  },
  reactions: { items: [], loading: false, error: null },
  notificationPrefs: { items: [] },
  channelInvitations: {
    items: [],
    loading: false,
    error: null,
    statusById: {},
  },
  channelJoinRequests: {
    items: joinRequests.map((jr) => ({
      ...jr,
      status: jr.status as "pending" | "accepted" | "declined",
    })),
    loading: false,
    error: null,
    statusById: {},
  },
  channelRoles: { items: [], loading: false, error: null, statusById: {} },
};

import workspacesReducer from "@store/workspacesSlice";
import messagesReducer from "@store/messagesSlice";
import notificationsReducer from "@store/notificationsSlice";
import preferencesReducer from "@store/preferencesSlice";
import reactionsReducer from "@store/reactionsSlice";
import notificationPrefReducer from "@store/notificationPrefSlice";
import channelInvitationsReducer from "@store/channelInvitationsSlice";
import channelRolesReducer from "@store/channelRolesSlice";

const store = configureStore({
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
  preloadedState,
});

describe("ChannelsPage - Demandes d’adhésion (join requests)", () => {
  test("Affiche les demandes d’adhésion en attente et permet d’accepter/refuser", async () => {
    // User admin, membre du channel, joinRequests présentes
    const store = configureStore({
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
      preloadedState,
    });
    render(<ChannelsPage />, {
      storeOverride: store,
      route: "/workspaces/ws1/channels/ch1",
    });
    // fireEvent.click(await screen.findByText(/general/i)); // plus nécessaire
    expect(
      await screen.findByText("Demandes d’adhésion en attente")
    ).toBeInTheDocument();
    const acceptBtn = screen.getAllByRole("button", { name: /accepter/i })[0];
    fireEvent.click(acceptBtn);
    await waitFor(() =>
      expect(screen.getByText(/succès/i)).toBeInTheDocument()
    );
    const declineBtn = screen.getAllByRole("button", { name: /refuser/i })[0];
    fireEvent.click(declineBtn);
    await waitFor(() =>
      expect(screen.getByText(/succès/i)).toBeInTheDocument()
    );
  });

  test("Permet d’envoyer une demande d’adhésion à un channel public", async () => {
    // User non membre, pas de joinRequest pour ce user/channel
    const userNonMembre = {
      ...users[2],
      id: users[2]._id,
      role: "member" as Role,
    };
    // On retire le user des membres du channel general
    const channelsSansUser = channels.map((c) =>
      c._id === "ch1"
        ? {
            ...c,
            members: c.members.filter((m) => m._id !== userNonMembre._id),
            type: c.type as "public" | "private" | "direct",
          }
        : { ...c, type: c.type as "public" | "private" | "direct" }
    );
    const joinRequestsSansUser = joinRequests
      .filter(
        (jr) => !(jr.channelId === "ch1" && jr.userId === userNonMembre._id)
      )
      .map((jr) => ({
        ...jr,
        status: jr.status as "pending" | "accepted" | "declined",
      }));
    const preloadedStateNonMembre = {
      ...preloadedState,
      auth: {
        user: userNonMembre,
        isAuthenticated: true,
        isLoading: false,
      },
      channels: {
        ...preloadedState.channels,
        items: channelsSansUser,
      },
      channelJoinRequests: {
        ...preloadedState.channelJoinRequests,
        items: joinRequestsSansUser,
      },
      channelInvitations: {
        items: [],
        loading: false,
        error: null,
        statusById: {},
      },
    };
    const store = configureStore({
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
      preloadedState: preloadedStateNonMembre,
    });
    render(<ChannelsPage />, {
      storeOverride: store,
      route: "/workspaces/ws1/channels/ch1",
    });
    // fireEvent.click(await screen.findByText(/general/i)); // plus nécessaire
    const joinBtn = await screen.findByRole("button", { name: /rejoindre/i });
    fireEvent.click(joinBtn);
    await waitFor(() =>
      expect(screen.getByText(/demande envoyée/i)).toBeInTheDocument()
    );
  });
});
