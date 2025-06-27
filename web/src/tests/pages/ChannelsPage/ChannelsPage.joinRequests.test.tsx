import { renderWithProviders } from "@tests/test-utils";
import { server } from "@tests/mocks/server";
import { rest } from "msw";
import ChannelsPage from "@pages/channels/ChannelsPage";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";

// Mocks et fixtures
import { channels, joinRequests, users } from "@tests/fixtures/channels";

// MSW handlers pour join requests
beforeEach(() => {
  server.use(
    rest.get("/api/channels/join-requests", (req, res, ctx) => {
      return res(ctx.json(joinRequests));
    }),
    rest.post("/api/channels/:id/join-request", (req, res, ctx) => {
      return res(ctx.status(201), ctx.json({ success: true }));
    }),
    rest.post("/api/channels/join-requests/:requestId/accept", (req, res, ctx) => {
      return res(ctx.status(200), ctx.json({ success: true }));
    }),
    rest.post("/api/channels/join-requests/:requestId/decline", (req, res, ctx) => {
      return res(ctx.status(200), ctx.json({ success: true }));
    })
  );
});

describe("ChannelsPage - Demandes d’adhésion (join requests)", () => {
  test("Affiche les demandes d’adhésion en attente et permet d’accepter/refuser", async () => {
    renderWithProviders(<ChannelsPage />);
    // Vérifie l’affichage des demandes
    expect(await screen.findByText("Demandes d’adhésion en attente")).toBeInTheDocument();
    // Simule acceptation
    const acceptBtn = screen.getAllByRole("button", { name: /accepter/i })[0];
    fireEvent.click(acceptBtn);
    await waitFor(() => expect(screen.getByText(/succès/i)).toBeInTheDocument());
    // Simule refus
    const declineBtn = screen.getAllByRole("button", { name: /refuser/i })[0];
    fireEvent.click(declineBtn);
    await waitFor(() => expect(screen.getByText(/succès/i)).toBeInTheDocument());
  });

  test("Permet d’envoyer une demande d’adhésion à un channel public", async () => {
    renderWithProviders(<ChannelsPage />);
    // Bouton "Rejoindre" visible pour un channel public non membre
    const joinBtn = await screen.findByRole("button", { name: /rejoindre/i });
    fireEvent.click(joinBtn);
    await waitFor(() => expect(screen.getByText(/demande envoyée/i)).toBeInTheDocument());
  });
});
