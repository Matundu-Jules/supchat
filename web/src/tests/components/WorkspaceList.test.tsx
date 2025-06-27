import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import { TestProvider } from "@tests/test-utils";
import WorkspaceList from "@components/Workspace/WorkspaceList";

describe("WorkspaceList", () => {
  it("should render without crashing", () => {
    const mockWorkspaces = [
      {
        _id: "1",
        name: "Test Workspace",
        description: "Test Description",
        isPublic: true,
        userStatus: {
          isMember: true,
          isOwner: false,
          hasRequestedJoin: false,
        },
      },
    ];

    render(
      <TestProvider>
        <WorkspaceList workspaces={mockWorkspaces} />
      </TestProvider>
    );

    // Test basic rendering
    expect(document.body).toBeInTheDocument();
  });
});
