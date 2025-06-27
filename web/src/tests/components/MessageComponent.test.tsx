import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import { TestProvider } from "@tests/test-utils";
import MessageItem from "@components/messaging/Message/MessageItem";

describe("MessageComponent", () => {
  it("should render without crashing", () => {
    const mockMessage = {
      _id: "1",
      text: "Test message",
      sender: {
        _id: "user1",
        name: "Test User",
        email: "test@example.com",
      },
      createdAt: new Date().toISOString(),
      channelId: "channel1",
    };

    render(
      <TestProvider>
        <MessageItem message={mockMessage} channelId="channel1" />
      </TestProvider>
    );

    // Test basic rendering
    expect(document.body).toBeInTheDocument();
  });
});
