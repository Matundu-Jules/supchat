import { screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ChannelList from "@components/messaging/Channel/ChannelList";
import { render } from "@tests/test-utils";
import type { Channel } from "@ts_types/channel";

// Mock du hook useChannelPermissions
vi.mock("@hooks/useChannelPermissions", () => ({
  useChannelPermissions: () => ({
    canView: true,
    canManage: false,
    canDelete: false,
    loading: false,
  }),
}));

const mockChannels: Channel[] = [
  {
    _id: "ch1",
    name: "general",
    description: "General discussion channel",
    type: "public",
    members: [],
    workspaceId: "ws1",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "ch2",
    name: "random",
    description: "Random chat",
    type: "public",
    members: [],
    workspaceId: "ws1",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "ch3",
    name: "tech-talk",
    description: "Technology discussions",
    type: "public",
    members: [],
    workspaceId: "ws1",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const defaultProps = {
  channels: mockChannels,
  userId: "test-user-id",
  onAccess: vi.fn(),
};

describe("ChannelList", () => {
  it("should render all channels when no filter is provided", () => {
    render(<ChannelList {...defaultProps} />);

    expect(screen.getByText("general")).toBeInTheDocument();
    expect(screen.getByText("random")).toBeInTheDocument();
    expect(screen.getByText("tech-talk")).toBeInTheDocument();
  });

  it('should display "no channels" message when channels array is empty', () => {
    render(<ChannelList {...defaultProps} channels={[]} />);

    expect(screen.getByText("Aucun canal pour le moment.")).toBeInTheDocument();
  });

  it("should filter channels by name", () => {
    render(<ChannelList {...defaultProps} filter="general" />);

    expect(screen.getByText("general")).toBeInTheDocument();
    expect(screen.queryByText("random")).not.toBeInTheDocument();
    expect(screen.queryByText("tech-talk")).not.toBeInTheDocument();
  });

  it("should filter channels by description", () => {
    render(<ChannelList {...defaultProps} filter="Technology" />);

    expect(screen.getByText("tech-talk")).toBeInTheDocument();
    expect(screen.queryByText("general")).not.toBeInTheDocument();
    expect(screen.queryByText("random")).not.toBeInTheDocument();
  });

  it("should be case insensitive when filtering", () => {
    render(<ChannelList {...defaultProps} filter="GENERAL" />);

    expect(screen.getByText("general")).toBeInTheDocument();
    expect(screen.queryByText("random")).not.toBeInTheDocument();
  });
  it('should show "no channels" message when filter matches nothing', () => {
    render(<ChannelList {...defaultProps} filter="nonexistent" />);

    expect(screen.getByText("Aucun canal pour le moment.")).toBeInTheDocument();
  });
  it("should call onAccess when channel is clicked", () => {
    const mockOnAccess = vi.fn();
    render(<ChannelList {...defaultProps} onAccess={mockOnAccess} />);

    const openButtons = screen.getAllByRole("button", { name: /ouvrir/i });
    fireEvent.click(openButtons[0]); // Click the first button

    expect(mockOnAccess).toHaveBeenCalledTimes(1);
    expect(mockOnAccess).toHaveBeenCalledWith(
      expect.objectContaining({
        _id: "ch1",
        name: "general",
        type: "public",
      })
    );
  });
  it("should handle channels without descriptions", () => {
    const channelsWithoutDescription = [
      {
        _id: "ch1",
        name: "general",
        type: "public" as const,
        members: [],
        workspaceId: "ws1",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    render(
      <ChannelList {...defaultProps} channels={channelsWithoutDescription} />
    );

    expect(screen.getByText("general")).toBeInTheDocument();
  });

  it("should filter channels without descriptions correctly", () => {
    const channelsWithoutDescription = [
      {
        _id: "ch1",
        name: "general",
        type: "public" as const,
        members: [],
        workspaceId: "ws1",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: "ch2",
        name: "random",
        description: "Random chat",
        type: "public" as const,
        members: [],
        workspaceId: "ws1",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    // Should find channel by name even without description
    render(
      <ChannelList
        {...defaultProps}
        channels={channelsWithoutDescription}
        filter="general"
      />
    );
    expect(screen.getByText("general")).toBeInTheDocument();

    // Should find channel by description
    render(
      <ChannelList
        {...defaultProps}
        channels={channelsWithoutDescription}
        filter="Random"
      />
    );
    expect(screen.getByText("random")).toBeInTheDocument();
  });

  it("should render multiple filtered results", () => {
    const channels = [
      {
        _id: "ch1",
        name: "general-chat",
        description: "General discussion",
        type: "public" as const,
        members: [],
        workspaceId: "ws1",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: "ch2",
        name: "general-help",
        description: "General help",
        type: "public" as const,
        members: [],
        workspaceId: "ws1",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: "ch3",
        name: "random",
        description: "Random stuff",
        type: "public" as const,
        members: [],
        workspaceId: "ws1",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    render(
      <ChannelList {...defaultProps} channels={channels} filter="general" />
    );

    expect(screen.getByText("general-chat")).toBeInTheDocument();
    expect(screen.getByText("general-help")).toBeInTheDocument();
    expect(screen.queryByText("random")).not.toBeInTheDocument();
  });
});
