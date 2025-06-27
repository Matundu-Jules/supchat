import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@tests/test-utils";
import ChannelsPage from "@pages/channels/ChannelsPage";
import userEvent from "@testing-library/user-event";

// --- MOCK LOGIC STATE ---
const sendMessageMock = vi.fn();
const fetchChannelsMock = vi.fn();
const inviteMock = vi.fn();
const removeMemberMock = vi.fn();
const handleChannelDeleteMock = vi.fn();

// État contrôlable pour chaque test
let mockLogicState = {};

vi.mock("@hooks/useChannelsPageLogic", () => ({
  useChannelsPageLogic: () => ({
    channelsLoading: false,
    activeChannelId: "test-channel",
    channelLoading: false,
    channel: {
      _id: "test-channel",
      name: "Général",
      type: "public",
      members: [
        { _id: "user-1", username: "Alice", role: "admin" },
        { _id: "user-2", username: "Bob", role: "member" },
      ],
      workspaceId: "ws1",
      description: "Canal général de discussion",
    },
    messages: [
      {
        _id: "msg-1",
        text: "Bonjour à tous !",
        author: { _id: "user-1", username: "Alice" },
        createdAt: new Date().toISOString(),
      },
    ],
    optimisticMessages: [],
    canActuallyWrite: true,
    handleSendMessage: sendMessageMock,
    userChannelRole: "admin",
    canEditChannel: true,
    canManageMembers: true,
    rightPanelView: null,
    closeRightPanel: vi.fn(),
    toggleRightPanel: vi.fn(),
    channels: [
      { _id: "test-channel", name: "Général", type: "public", unreadCount: 0 },
    ],
    searchQuery: "",
    setSearchQuery: vi.fn(),
    showEditModal: false,
    setShowEditModal: vi.fn(),
    showCreateChannel: false,
    setShowCreateChannel: vi.fn(),
    showInviteModal: false,
    setShowInviteModal: vi.fn(),
    workspaceId: "ws1",
    workspaceUsers: [
      { _id: "user-1", username: "Alice", email: "alice@test.com" },
      { _id: "user-2", username: "Bob", email: "bob@test.com" },
    ],
    handleChannelSelect: vi.fn(),
    handleChannelUpdate: vi.fn(),
    handleChannelDelete: handleChannelDeleteMock,
    handleCreateChannelSubmit: vi.fn(),
    fetchChannels: fetchChannelsMock,
    invite: inviteMock,
    removeMember: removeMemberMock,
    inviteLoading: false,
    inviteError: null,
    inviteSuccess: false,
    updating: false,
    updateError: null,
    messageError: null,
    messagesError: null,
    messagesLoading: false,
    setMessageError: vi.fn(),
    setOptimisticMessages: vi.fn(),
    canCreateChannels: true,
    ...mockLogicState,
  }),
}));

describe("ChannelsPage - Messagerie temps réel (suite complète)", () => {
  const user = userEvent.setup();
  let originalConfirm;

  beforeEach(() => {
    sendMessageMock.mockClear();
    fetchChannelsMock.mockClear();
    inviteMock.mockClear();
    removeMemberMock.mockClear();
    handleChannelDeleteMock.mockClear();
    mockLogicState = {};
    originalConfirm = window.confirm;
  });

  afterEach(() => {
    window.confirm = originalConfirm;
  });

  it("affiche la liste des messages du canal actif", () => {
    render(<ChannelsPage />);
    expect(screen.getByText("Bonjour à tous !")).toBeInTheDocument();
    expect(screen.getByText("Général")).toBeInTheDocument();
  });

  it("permet d'envoyer un message et appelle la logique métier", async () => {
    render(<ChannelsPage />);
    const input = screen.getByLabelText("Saisir un message");
    await user.type(input, "Hello SUPCHAT!");
    const form = input.closest("form");
    if (form) {
      fireEvent.submit(form);
    }
    expect(sendMessageMock).toHaveBeenCalled();
    const callArgs = sendMessageMock.mock.calls[0];
    expect(callArgs[0]).toBe("Hello SUPCHAT!");
  });

  it("affiche un message d'erreur si l'envoi échoue", () => {
    mockLogicState = {
      messageError: "Erreur d'envoi",
    };
    render(<ChannelsPage />);
    expect(screen.getByText("Erreur d'envoi")).toBeInTheDocument();
  });

  it("affiche le message d'absence de permission si canActuallyWrite = false", () => {
    mockLogicState = { canActuallyWrite: false };
    render(<ChannelsPage />);
    expect(
      screen.getByText("Vous n'avez pas la permission d'écrire dans ce canal")
    ).toBeInTheDocument();
  });

  it("affiche la liste des membres du canal dans le panel droit", () => {
    mockLogicState = { rightPanelView: "members" };
    render(<ChannelsPage />);
    expect(screen.getByText("Membres du canal")).toBeInTheDocument();
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
  });

  it("permet d'inviter un membre via le panel droit", () => {
    mockLogicState = { rightPanelView: "members", showInviteModal: true };
    render(<ChannelsPage />);
    expect(screen.getByText("Inviter des membres")).toBeInTheDocument();
  });

  it("permet de retirer un membre (autre que soi)", async () => {
    mockLogicState = { rightPanelView: "members" };
    render(<ChannelsPage />);
    const removeBtns = screen.getAllByTitle("Retirer du canal");
    expect(removeBtns.length).toBeGreaterThan(0);
    await user.click(removeBtns[0]);
    expect(removeMemberMock).toHaveBeenCalled();
  });

  it("affiche le panneau paramètres et permet de supprimer le canal", async () => {
    mockLogicState = { rightPanelView: "settings" };
    window.confirm = vi.fn(() => true);
    render(<ChannelsPage />);
    expect(screen.getByText("Paramètres du canal")).toBeInTheDocument();
    const deleteBtn = screen.getByText("Supprimer le canal");
    await user.click(deleteBtn);
    expect(handleChannelDeleteMock).toHaveBeenCalled();
  });

  it("affiche le panneau gestion des rôles", () => {
    mockLogicState = { rightPanelView: "roles" };
    render(<ChannelsPage />);
    expect(screen.getByText("Gestion des rôles")).toBeInTheDocument();
  });

  it("affiche le bouton de création de canal si autorisé", () => {
    mockLogicState = { canCreateChannels: true };
    render(<ChannelsPage />);
    expect(screen.getByTitle("Créer un nouveau canal")).toBeInTheDocument();
  });

  it("affiche l'état vide si aucun canal n'est présent", () => {
    mockLogicState = { channels: [], canCreateChannels: true };
    render(<ChannelsPage />);
    expect(screen.getByText("Aucun canal disponible")).toBeInTheDocument();
  });
});
