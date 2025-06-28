import { render } from "@tests/test-utils";
import { server } from "@tests/mocks/server";
import { rest } from "msw";
import ChannelsPage from "@pages/channels/ChannelsPage";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";

// Mocks et fixtures
import { channels, roles, users } from "@tests/fixtures/channels";

// MSW handlers pour gestion des rôles
beforeEach(() => {
  server.use(
    rest.get("/api/channels/roles", (req, res, ctx) => {
      return res(ctx.json(roles));
    }),
    rest.post("/api/channels/:id/members/:userId/promote", (req, res, ctx) => {
      return res(ctx.status(200), ctx.json({ success: true }));
    }),
    rest.post("/api/channels/:id/members/:userId/demote", (req, res, ctx) => {
      return res(ctx.status(200), ctx.json({ success: true }));
    })
  );
});

describe("ChannelsPage - Gestion des rôles (promotion/rétrogradation)", () => {
  test("Affiche les boutons Promouvoir/Rétrograder pour les admins et permet l’action", async () => {
    render(<ChannelsPage />);
    // Boutons présents
    expect(await screen.findByRole("button", { name: /promouvoir/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /rétrograder/i })).toBeInTheDocument();
    // Simule promotion
    const promoteBtn = screen.getByRole("button", { name: /promouvoir/i });
    fireEvent.click(promoteBtn);
    await waitFor(() => expect(screen.getByText(/succès/i)).toBeInTheDocument());
    // Simule rétrogradation
    const demoteBtn = screen.getByRole("button", { name: /rétrograder/i });
    fireEvent.click(demoteBtn);
    await waitFor(() => expect(screen.getByText(/succès/i)).toBeInTheDocument());
  });
});
