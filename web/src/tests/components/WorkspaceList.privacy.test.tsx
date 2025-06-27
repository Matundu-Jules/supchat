import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import WorkspaceList from "@components/Workspace/WorkspaceList";
import "@tests/setup";

describe("WorkspaceList - Privacy Display", () => {
  const mockUser = {
    _id: "user1",
    email: "test@example.com",
    role: "user",
  };
  const createMockWorkspace = (
    id: string,
    name: string,
    isPublic: boolean,
    isOwner = true
  ) => ({
    _id: id,
    name,
    description: `Description for ${name}`,
    isPublic,
    owner: {
      _id: isOwner ? "user1" : "user2",
      email: isOwner ? "test@example.com" : "other@example.com",
    },
    members: [{ _id: "user1", email: "test@example.com" }],
    userStatus: {
      isMember: true,
      isOwner,
      hasRequestedJoin: false,
      isInvited: false,
    },
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should display correct privacy badge for public workspace", () => {
    const publicWorkspace = createMockWorkspace(
      "ws1",
      "Public Workspace",
      true
    );

    render(<WorkspaceList workspaces={[publicWorkspace]} user={mockUser} />);
    expect(screen.getByText("Public Workspace")).toBeInTheDocument();
    expect(screen.getByText("Public")).toBeInTheDocument();

    // Le badge public devrait contenir la classe public (CSS modules génèrent des noms hachés)
    const publicBadge = screen.getByText("Public");
    expect(publicBadge.className).toContain("public");
  });

  it("should display correct privacy badge for private workspace", () => {
    const privateWorkspace = createMockWorkspace(
      "ws1",
      "Private Workspace",
      false
    );

    render(<WorkspaceList workspaces={[privateWorkspace]} user={mockUser} />);
    expect(screen.getByText("Private Workspace")).toBeInTheDocument();
    expect(screen.getByText("Privé")).toBeInTheDocument();

    // Le badge privé devrait contenir la classe private (CSS modules génèrent des noms hachés)
    const privateBadge = screen.getByText("Privé");
    expect(privateBadge.className).toContain("private");
  });

  it("should update privacy badge when workspace data changes", async () => {
    const { rerender } = render(
      <WorkspaceList
        workspaces={[createMockWorkspace("ws1", "Test Workspace", false)]}
        user={mockUser}
      />
    );

    // Initialement privé
    expect(screen.getByText("Privé")).toBeInTheDocument();
    expect(screen.queryByText("Public")).not.toBeInTheDocument();

    // Simulation d'une mise à jour où le workspace devient public
    rerender(
      <WorkspaceList
        workspaces={[createMockWorkspace("ws1", "Test Workspace", true)]}
        user={mockUser}
      />
    );

    // Maintenant public
    await waitFor(() => {
      expect(screen.getByText("Public")).toBeInTheDocument();
      expect(screen.queryByText("Privé")).not.toBeInTheDocument();
    });
  });

  it("should show edit button for workspace owner", () => {
    const workspace = createMockWorkspace("ws1", "My Workspace", false, true);
    const onEdit = vi.fn();

    render(
      <WorkspaceList workspaces={[workspace]} user={mockUser} onEdit={onEdit} />
    );

    const editButton = screen.getByRole("button", { name: /modifier/i });
    expect(editButton).toBeInTheDocument();
  });

  it("should call onEdit with correct workspace data when edit button is clicked", async () => {
    const workspace = createMockWorkspace("ws1", "My Workspace", false, true);
    const onEdit = vi.fn();
    const user = userEvent.setup();

    render(
      <WorkspaceList workspaces={[workspace]} user={mockUser} onEdit={onEdit} />
    );

    const editButton = screen.getByRole("button", { name: /modifier/i });
    await user.click(editButton);

    expect(onEdit).toHaveBeenCalledWith(workspace);
  });

  it("should not show edit button for non-owner", () => {
    const workspace = createMockWorkspace(
      "ws1",
      "Other Workspace",
      false,
      false
    );

    render(<WorkspaceList workspaces={[workspace]} user={mockUser} />);

    const editButton = screen.queryByRole("button", { name: /modifier/i });
    expect(editButton).not.toBeInTheDocument();
  });

  it("should handle multiple workspaces with different privacy settings", () => {
    const workspaces = [
      createMockWorkspace("ws1", "Public Workspace 1", true),
      createMockWorkspace("ws2", "Private Workspace 1", false),
      createMockWorkspace("ws3", "Public Workspace 2", true),
      createMockWorkspace("ws4", "Private Workspace 2", false),
    ];

    render(<WorkspaceList workspaces={workspaces} user={mockUser} />);

    // Vérifier que tous les workspaces sont affichés
    expect(screen.getByText("Public Workspace 1")).toBeInTheDocument();
    expect(screen.getByText("Private Workspace 1")).toBeInTheDocument();
    expect(screen.getByText("Public Workspace 2")).toBeInTheDocument();
    expect(screen.getByText("Private Workspace 2")).toBeInTheDocument();

    // Vérifier les badges
    const publicBadges = screen.getAllByText("Public");
    const privateBadges = screen.getAllByText("Privé");

    expect(publicBadges).toHaveLength(2);
    expect(privateBadges).toHaveLength(2);
  });

  it("should re-render correctly when workspace list is updated after edit", async () => {
    const initialWorkspace = createMockWorkspace(
      "ws1",
      "Test Workspace",
      false
    );
    const updatedWorkspace = createMockWorkspace("ws1", "Test Workspace", true); // Même ID mais public maintenant

    const { rerender } = render(
      <WorkspaceList workspaces={[initialWorkspace]} user={mockUser} />
    );

    // État initial : privé
    expect(screen.getByText("Test Workspace")).toBeInTheDocument();
    expect(screen.getByText("Privé")).toBeInTheDocument();

    // Simulation d'une mise à jour après modification (comme après fetchWorkspaces())
    rerender(<WorkspaceList workspaces={[updatedWorkspace]} user={mockUser} />);

    // État après mise à jour : public
    await waitFor(() => {
      expect(screen.getByText("Test Workspace")).toBeInTheDocument();
      expect(screen.getByText("Public")).toBeInTheDocument();
      expect(screen.queryByText("Privé")).not.toBeInTheDocument();
    });
  });
});
