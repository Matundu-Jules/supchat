import React from "react";
import { describe, it, expect, beforeEach } from "vitest";
import { render } from "@tests/test-utils";
import { configureStore } from "@reduxjs/toolkit";

import { server } from "@tests/mocks/server";
import { http } from "msw";
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

// Mocks MSW pour les endpoints d'invitation
const invitations = [
  {
    _id: "inv1",
    channelId: "chan1",
    channelName: "Général",
    invitedBy: {
      _id: "admin1",
      email: "admin@supchat.com",
      username: "Admin User",
    },
    invitedByName: "Admin User",
    email: "user2@supchat.com",
    recipient: "user2", // Pour la logique UI
    userId: "user2", // Pour compatibilité backend
    status: "pending" as const, // Correction typage strict
    invitedAt: new Date().toISOString(),
  },
];

const channels = [
  {
    _id: "chan1",
    name: "Général",
    type: "public",
    members: [], // Le user n'est PAS membre, il est invité
    description: "Canal général",
    workspaceId: "ws1",
  },
];

beforeEach(() => {
  server.use(
    http.get(/\/workspaces\/.*\/channels$/, () => {
      return new Response(JSON.stringify({ channels }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }),
    http.get(/\/channel-invitations$/, () => {
      return new Response(JSON.stringify({ invitations }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }),
    http.post(/\/channel-invitations\/respond(\/.*)?$/, async ({ request }) => {
      let accept = false;
      try {
        const body = await request.json();
        if (typeof body === "object" && body !== null && "accept" in body) {
          accept = Boolean(body["accept"]);
        }
      } catch {
        accept = false;
      }
      return new Response(
        JSON.stringify({
          invitation: {
            ...invitations[0],
            status: accept ? "accepted" : "declined",
          },
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }),
    // Handler catch-all pour log toutes les requêtes non matchées
    http.all(/.*/, async ({ request }) => {
      console.error(`[MSW][UNMATCHED] ${request.method} ${request.url}`);
      return new Response(null, { status: 200 });
    })
  );
});

describe("ChannelsPage - Invitations (envoi, acceptation, refus)", () => {
  // Store custom avec user connecté (user2)
  const user = {
    id: "user2",
    _id: "user2",
    email: "user2@supchat.com",
    name: "User 2",
    role: "membre" as Role, // Cast explicite au type Role
  };
  let store: typeof mainStore;

  beforeEach(() => {
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
              role: "invité" as ChannelRole,
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

  // DEBUG LOGS pour traçage test
  console.log("[TEST] user:", user);
  console.log("[TEST] invitation:", invitations[0]);

  it("affiche la liste des invitations en attente", async () => {
    render(<ChannelsPage />, {
      storeOverride: store,
      route: "/workspaces/ws1/channels",
    });
    expect(
      await screen.findByText("Invitations en attente")
    ).toBeInTheDocument();
    expect(screen.getByText("Général")).toBeInTheDocument();
    expect(
      await screen.findByRole("button", { name: /Accepter/i })
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("button", { name: /Refuser/i })
    ).toBeInTheDocument();
  });

  it("permet d'accepter une invitation et affiche un feedback de succès", async () => {
    render(<ChannelsPage />, {
      storeOverride: store,
      route: "/workspaces/ws1/channels",
    });
    const acceptBtn = await screen.findByRole("button", { name: /Accepter/i });
    await userEvent.click(acceptBtn);
    expect(
      await screen.findByText(/Invitation acceptée(\s+|\n|.)*succès/i, {
        collapseWhitespace: true,
      })
    ).toBeInTheDocument();
  });

  it("permet de refuser une invitation et affiche un feedback de succès", async () => {
    render(<ChannelsPage />, {
      storeOverride: store,
      route: "/workspaces/ws1/channels",
    });
    const declineBtn = await screen.findByRole("button", { name: /Refuser/i });
    await userEvent.click(declineBtn);
    expect(
      await screen.findByText(/Invitation refusée/i, {
        collapseWhitespace: true,
      })
    ).toBeInTheDocument();
  });
});
