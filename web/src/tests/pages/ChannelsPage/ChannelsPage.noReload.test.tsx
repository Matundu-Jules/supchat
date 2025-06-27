import React from "react";
import { describe, it, vi, expect } from "vitest";
import { render, fireEvent, screen } from "@tests/test-utils";
import ChannelsPage from "@pages/channels/ChannelsPage";
import userEvent from "@testing-library/user-event";

// Déclare le mock à l'extérieur pour le partager
const handleSendMessageMock = vi.fn();

// Mock la logique pour éviter les appels API réels
vi.mock("@hooks/useChannelsPageLogic", () => ({
  useChannelsPageLogic: () => ({
    channelsLoading: false,
    activeChannelId: "test-channel",
    channelLoading: false,
    channel: {
      _id: "test-channel",
      name: "Général",
      type: "public",
      members: [],
      workspaceId: "ws1",
    },
    messages: [],
    optimisticMessages: [],
    canActuallyWrite: true,
    handleSendMessage: handleSendMessageMock,
    // ...autres mocks nécessaires pour le rendu minimal
    userChannelRole: "admin",
    canEditChannel: true,
    canManageMembers: true,
    rightPanelView: null,
    closeRightPanel: vi.fn(),
    toggleRightPanel: vi.fn(),
    channels: [],
    searchQuery: "",
    setSearchQuery: vi.fn(),
    showEditModal: false,
    setShowEditModal: vi.fn(),
    showCreateChannel: false,
    setShowCreateChannel: vi.fn(),
    showInviteModal: false,
    setShowInviteModal: vi.fn(),
    workspaceId: "ws1",
    workspaceUsers: [],
    handleChannelSelect: vi.fn(),
    handleChannelUpdate: vi.fn(),
    handleChannelDelete: vi.fn(),
    handleCreateChannelSubmit: vi.fn(),
    fetchChannels: vi.fn(),
    invite: vi.fn(),
    removeMember: vi.fn(),
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
  }),
}));

describe("ChannelsPage - Envoi message ne reload pas la page", () => {
  const user = userEvent.setup();

  it("n'appelle jamais window.location.reload lors de l'envoi d'un message (test indirect, pas de reload)", async () => {
    render(<ChannelsPage />);
    const input = screen.getByLabelText("Saisir un message");
    await user.type(input, "Hello world!");
    const form = input.closest("form");
    if (form) {
      fireEvent.submit(form);
    }
    // Vérifie que l'input est toujours présent (pas de reload effectif)
    expect(screen.getByLabelText("Saisir un message")).toBeInTheDocument();
    // Vérifie que la fonction de soumission a bien été appelée avec le bon message
    expect(handleSendMessageMock).toHaveBeenCalled();
    const callArgs = handleSendMessageMock.mock.calls[0];
    expect(callArgs[0]).toBe("Hello world!");
  });
});
