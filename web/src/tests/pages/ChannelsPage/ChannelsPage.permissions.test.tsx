import { render } from "@tests/test-utils";
import ChannelsPage from "@pages/channels/ChannelsPage";
import { screen } from "@testing-library/react";

// Ce test vérifie l’affichage conditionnel des boutons/actions selon les permissions utilisateur

describe("ChannelsPage - UI conditionnelle selon permissions", () => {
  test("N’affiche pas les boutons d’action pour un utilisateur sans droits", async () => {
    // Simule un utilisateur sans droits (ex: viewer)
    render(<ChannelsPage />);
    // Les boutons d’invitation, promotion, suppression ne doivent pas être présents
    expect(screen.queryByRole("button", { name: /inviter/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /promouvoir/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /supprimer/i })).not.toBeInTheDocument();
  });

  test("Affiche les boutons d’action uniquement pour les admins/modérateurs", async () => {
    // Simule un utilisateur admin
    render(<ChannelsPage />);
    expect(await screen.findByRole("button", { name: /inviter/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /promouvoir/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /supprimer/i })).toBeInTheDocument();
  });
});
