import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ChannelList, { Channel } from "../index";

const mockChannels: Channel[] = [
  {
    _id: "ch1",
    name: "general",
    description: "General discussion channel",
    type: "text",
  },
  {
    _id: "ch2",
    name: "random",
    description: "Random chat",
    type: "text",
  },
  {
    _id: "ch3",
    name: "tech-talk",
    description: "Technology discussions",
    type: "text",
  },
];

describe("ChannelList", () => {
  it("should render all channels when no filter is provided", () => {
    render(<ChannelList channels={mockChannels} />);

    expect(screen.getByText("general")).toBeInTheDocument();
    expect(screen.getByText("random")).toBeInTheDocument();
    expect(screen.getByText("tech-talk")).toBeInTheDocument();
  });

  it('should display "no channels" message when channels array is empty', () => {
    render(<ChannelList channels={[]} />);

    expect(screen.getByText("Aucun canal pour le moment.")).toBeInTheDocument();
  });

  it("should filter channels by name", () => {
    render(<ChannelList channels={mockChannels} filter="general" />);

    expect(screen.getByText("general")).toBeInTheDocument();
    expect(screen.queryByText("random")).not.toBeInTheDocument();
    expect(screen.queryByText("tech-talk")).not.toBeInTheDocument();
  });

  it("should filter channels by description", () => {
    render(<ChannelList channels={mockChannels} filter="Technology" />);

    expect(screen.getByText("tech-talk")).toBeInTheDocument();
    expect(screen.queryByText("general")).not.toBeInTheDocument();
    expect(screen.queryByText("random")).not.toBeInTheDocument();
  });

  it("should be case insensitive when filtering", () => {
    render(<ChannelList channels={mockChannels} filter="GENERAL" />);

    expect(screen.getByText("general")).toBeInTheDocument();
    expect(screen.queryByText("random")).not.toBeInTheDocument();
  });

  it('should show "no channels" message when filter matches nothing', () => {
    render(<ChannelList channels={mockChannels} filter="nonexistent" />);

    expect(screen.getByText("Aucun canal pour le moment.")).toBeInTheDocument();
  });
  it("should call onAccess when channel is clicked", () => {
    const mockOnAccess = vi.fn();
    render(<ChannelList channels={mockChannels} onAccess={mockOnAccess} />);

    const openButtons = screen.getAllByRole("button", { name: /ouvrir/i });
    fireEvent.click(openButtons[0]); // Click the first button

    expect(mockOnAccess).toHaveBeenCalledTimes(1);
    expect(mockOnAccess).toHaveBeenCalledWith({
      _id: "ch1",
      name: "general",
      description: "General discussion channel",
      type: "text",
    });
  });

  it("should handle channels without descriptions", () => {
    const channelsWithoutDescription: Channel[] = [
      {
        _id: "ch1",
        name: "general",
        type: "text",
      },
    ];

    render(<ChannelList channels={channelsWithoutDescription} />);

    expect(screen.getByText("general")).toBeInTheDocument();
  });

  it("should filter channels without descriptions correctly", () => {
    const channelsWithoutDescription: Channel[] = [
      {
        _id: "ch1",
        name: "general",
        type: "text",
      },
      {
        _id: "ch2",
        name: "random",
        description: "Random chat",
        type: "text",
      },
    ];

    // Should find channel by name even without description
    render(
      <ChannelList channels={channelsWithoutDescription} filter="general" />
    );
    expect(screen.getByText("general")).toBeInTheDocument();

    // Should find channel by description
    render(
      <ChannelList channels={channelsWithoutDescription} filter="Random" />
    );
    expect(screen.getByText("random")).toBeInTheDocument();
  });

  it("should render multiple filtered results", () => {
    const channels: Channel[] = [
      {
        _id: "ch1",
        name: "general-chat",
        description: "General discussion",
        type: "text",
      },
      {
        _id: "ch2",
        name: "general-help",
        description: "General help",
        type: "text",
      },
      { _id: "ch3", name: "random", description: "Random stuff", type: "text" },
    ];

    render(<ChannelList channels={channels} filter="general" />);

    expect(screen.getByText("general-chat")).toBeInTheDocument();
    expect(screen.getByText("general-help")).toBeInTheDocument();
    expect(screen.queryByText("random")).not.toBeInTheDocument();
  });
});
