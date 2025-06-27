import React from "react";
import { describe, it, expect, beforeEach } from "vitest";
import { render } from "@tests/test-utils";
import { configureStore } from "@reduxjs/toolkit";

import { server } from "@tests/mocks/server";
import { http, HttpResponse } from "msw";
import ChannelsPage from "@pages/channels/ChannelsPage";
import userEvent from "@testing-library/user-event";
import { screen, waitFor } from "@testing-library/react";
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
import type { ChannelRole } from "@ts_types/channel";
import { store as mainStore } from "@store/store";

// ✅ Données de test simplifiées et typées
const invitations = [
  {
    _id: "inv1",
    channelId: "ch1", // unified ID
    channelName: "Général",
    invitedBy: {
      _id: "admin1",
      email: "admin@supchat.com",
      username: "Admin User",
    },
    invitedByName: "Admin User",
    email: "user2@supchat.com",
    recipient: "user2",
    userId: "user2",
    status: "pending" as const,
    invitedAt: new Date().toISOString(),
  },
];

const channels = [
  {
    _id: "ch1", // unified ID
    name: "Général",
    type: "public",
    members: [],
    description: "Canal général",
    workspaceId: "ws1",
  },
];

// ✅ Configuration MSW simplifiée avec nouvelle syntaxe
beforeEach(() => {
  server.use(
    http.get("*/workspaces/*/channels", () => {
      return HttpResponse.json({ channels });
    }),

    http.get("*/channel-invitations", () => {
      return HttpResponse.json({ invitations });
    }),

    http.post("*/channel-invitations/respond", async ({ request }) => {
      const body = (await request.json()) as { accept?: boolean };
      const accept = body?.accept || false;

      return HttpResponse.json({
        invitation: {
          ...invitations[0],
          status: accept ? "accepted" : "declined",
        },
      });
    })
  );
});

describe("ChannelsPage - Invitations (envoi, acceptation, refus)", () => {
  // ✅ User typé sans cast explicite
  const user = {
    id: "user2",
    _id: "user2",
    email: "user2@supchat.com",
    name: "User 2",
    role: "membre" satisfies Role, // ✅ utilise `satisfies` au lieu de `as`
  };

  let store: typeof mainStore;

  beforeEach(() => {
    // ✅ Configuration du store simplifiée
    store = configureStore({
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
        auth: {
          user,
          isAuthenticated: true,
          isLoading: false,
        },
        channelInvitations: {
          items: invitations,
          loading: false,
          error: null,
          statusById: {},
        },
        channelRoles: {
          items: [
            {
              userId: "user2",
              channelId: "chan1",
              role: "invité" satisfies ChannelRole, // ✅ utilise `satisfies`
              updatedAt: new Date().toISOString(),
            },
          ],
          loading: false,
          error: null,
          statusById: {},
        },
      },
    }) as typeof mainStore;
  });

  // ✅ Tests simplifiés avec attentes plus précises
  it("affiche la liste des invitations en attente", async () => {
    render(<ChannelsPage />, {
      storeOverride: store,
      route: "/workspaces/ws1/channels",
    });

    // ✅ Attentes simples et précises
    expect(
      await screen.findByText("Invitations en attente")
    ).toBeInTheDocument();

    expect(screen.getByText("Général")).toBeInTheDocument();

    expect(
      await screen.findByRole("button", { name: /accepter/i })
    ).toBeInTheDocument();

    expect(
      await screen.findByRole("button", { name: /refuser/i })
    ).toBeInTheDocument();
  });

  it("permet d'accepter une invitation et affiche un feedback de succès", async () => {
    const user = userEvent.setup();

    render(<ChannelsPage />, {
      storeOverride: store,
      route: "/workspaces/ws1/channels",
    });

    const acceptBtn = await screen.findByRole("button", { name: /accepter/i });
    await user.click(acceptBtn);

    // ✅ Attente simplifiée - recherche le message de succès exact
    await waitFor(
      () => {
        expect(screen.getByText(/invitation acceptée/i)).toBeInTheDocument();
      },
      { timeout: 5000 } // ✅ Timeout explicite
    );
  });

  it("permet de refuser une invitation et affiche un feedback de succès", async () => {
    const user = userEvent.setup();

    render(<ChannelsPage />, {
      storeOverride: store,
      route: "/workspaces/ws1/channels",
    });

    const declineBtn = await screen.findByRole("button", { name: /refuser/i });
    await user.click(declineBtn);

    // ✅ Attente simplifiée
    await waitFor(
      () => {
        expect(screen.getByText(/invitation refusée/i)).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  });
});
