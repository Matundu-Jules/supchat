import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import EditWorkspaceModal from "@components/Workspace/EditWorkspaceModal";
import "../../tests/setup";

describe("EditWorkspaceModal - Privacy Toggle", () => {
  const mockWorkspace = {
    _id: "ws1",
    name: "Test Workspace",
    description: "Test description",
    isPublic: false,
  };

  const defaultProps = {
    workspace: mockWorkspace,
    isOpen: true,
    onClose: vi.fn(),
    onSave: vi.fn(),
    loading: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render with initial workspace data", () => {
    render(<EditWorkspaceModal {...defaultProps} />);

    expect(screen.getByDisplayValue("Test Workspace")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Test description")).toBeInTheDocument();

    const checkbox = screen.getByRole("checkbox", {
      name: /workspace public/i,
    });
    expect(checkbox).not.toBeChecked(); // Privé par défaut
  });

  it("should toggle privacy from private to public", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();

    render(<EditWorkspaceModal {...defaultProps} onSave={onSave} />);

    const checkbox = screen.getByRole("checkbox", {
      name: /workspace public/i,
    });

    // Vérifier l'état initial (privé)
    expect(checkbox).not.toBeChecked();
    expect(screen.getByText(/ce workspace sera privé/i)).toBeInTheDocument();

    // Cliquer sur la checkbox pour rendre public
    await user.click(checkbox);

    // Vérifier que la checkbox est maintenant cochée
    expect(checkbox).toBeChecked();
    expect(
      screen.getByText(/ce workspace sera visible par tous/i)
    ).toBeInTheDocument();

    // Soumettre le formulaire
    const submitButton = screen.getByRole("button", { name: /enregistrer/i });
    await user.click(submitButton);

    // Vérifier que onSave a été appelé avec isPublic: true
    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith({
        name: "Test Workspace",
        description: "Test description",
        isPublic: true,
      });
    });
  });

  it("should toggle privacy from public to private", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();

    const publicWorkspace = { ...mockWorkspace, isPublic: true };

    render(
      <EditWorkspaceModal
        {...defaultProps}
        workspace={publicWorkspace}
        onSave={onSave}
      />
    );

    const checkbox = screen.getByRole("checkbox", {
      name: /workspace public/i,
    });

    // Vérifier l'état initial (public)
    expect(checkbox).toBeChecked();
    expect(
      screen.getByText(/ce workspace sera visible par tous/i)
    ).toBeInTheDocument();

    // Cliquer sur la checkbox pour rendre privé
    await user.click(checkbox);

    // Vérifier que la checkbox n'est plus cochée
    expect(checkbox).not.toBeChecked();
    expect(screen.getByText(/ce workspace sera privé/i)).toBeInTheDocument();

    // Soumettre le formulaire
    const submitButton = screen.getByRole("button", { name: /enregistrer/i });
    await user.click(submitButton);

    // Vérifier que onSave a été appelé avec isPublic: false
    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith({
        name: "Test Workspace",
        description: "Test description",
        isPublic: false,
      });
    });
  });

  it("should update all fields including privacy", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();

    render(<EditWorkspaceModal {...defaultProps} onSave={onSave} />);

    // Modifier le nom
    const nameInput = screen.getByDisplayValue("Test Workspace");
    await user.clear(nameInput);
    await user.type(nameInput, "Updated Workspace Name");

    // Modifier la description
    const descriptionInput = screen.getByDisplayValue("Test description");
    await user.clear(descriptionInput);
    await user.type(descriptionInput, "Updated description");

    // Changer la visibilité
    const checkbox = screen.getByRole("checkbox", {
      name: /workspace public/i,
    });
    await user.click(checkbox);

    // Soumettre le formulaire
    const submitButton = screen.getByRole("button", { name: /enregistrer/i });
    await user.click(submitButton);

    // Vérifier que toutes les modifications ont été prises en compte
    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith({
        name: "Updated Workspace Name",
        description: "Updated description",
        isPublic: true,
      });
    });
  });

  it("should display the correct help text based on privacy setting", async () => {
    const user = userEvent.setup();

    render(<EditWorkspaceModal {...defaultProps} />);

    const checkbox = screen.getByRole("checkbox", {
      name: /workspace public/i,
    });

    // Vérifier le texte d'aide pour un workspace privé
    expect(
      screen.getByText(
        /ce workspace sera privé et accessible uniquement sur invitation/i
      )
    ).toBeInTheDocument();

    // Changer en public
    await user.click(checkbox);

    // Vérifier le texte d'aide pour un workspace public
    expect(
      screen.getByText(
        /ce workspace sera visible par tous les utilisateurs et ils pourront demander à le rejoindre/i
      )
    ).toBeInTheDocument();

    // Remettre en privé
    await user.click(checkbox);

    // Vérifier que le texte est revenu à privé
    expect(
      screen.getByText(
        /ce workspace sera privé et accessible uniquement sur invitation/i
      )
    ).toBeInTheDocument();
  });

  it("should validate required fields", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();

    render(<EditWorkspaceModal {...defaultProps} onSave={onSave} />);

    // Vider le nom (requis)
    const nameInput = screen.getByDisplayValue("Test Workspace");
    await user.clear(nameInput);

    // Essayer de soumettre
    const submitButton = screen.getByRole("button", { name: /enregistrer/i });
    await user.click(submitButton);

    // Vérifier qu'une erreur est affichée et que onSave n'a pas été appelé
    await waitFor(() => {
      expect(screen.getByText(/le nom est requis/i)).toBeInTheDocument();
      expect(onSave).not.toHaveBeenCalled();
    });
  });

  it("should close modal when cancel button is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(<EditWorkspaceModal {...defaultProps} onClose={onClose} />);

    const cancelButton = screen.getByRole("button", { name: /annuler/i });
    await user.click(cancelButton);

    expect(onClose).toHaveBeenCalled();
  });

  it("should close modal when X button is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(<EditWorkspaceModal {...defaultProps} onClose={onClose} />);

    const closeButton = screen.getByRole("button", { name: "×" });
    await user.click(closeButton);

    expect(onClose).toHaveBeenCalled();
  });

  it("should not render when isOpen is false", () => {
    const { container } = render(
      <EditWorkspaceModal {...defaultProps} isOpen={false} />
    );

    expect(container.firstChild).toBeNull();
  });

  it("should disable form elements when loading", () => {
    render(<EditWorkspaceModal {...defaultProps} loading={true} />);

    const nameInput = screen.getByDisplayValue("Test Workspace");
    const descriptionInput = screen.getByDisplayValue("Test description");
    const checkbox = screen.getByRole("checkbox", {
      name: /workspace public/i,
    });
    const submitButton = screen.getByRole("button", {
      name: /enregistrement.../i,
    });
    const cancelButton = screen.getByRole("button", { name: /annuler/i });
    const closeButton = screen.getByRole("button", { name: "×" });

    expect(nameInput).toBeDisabled();
    expect(descriptionInput).toBeDisabled();
    expect(checkbox).toBeDisabled();
    expect(submitButton).toBeDisabled();
    expect(cancelButton).toBeDisabled();
    expect(closeButton).toBeDisabled();
  });
});
