import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect } from "vitest";
import WorkspaceList from "../Workspace/WorkspaceList";
import { workspaces } from "../../tests/fixtures/workspaces";

describe("WorkspaceList", () => {
  it("renders workspaces and triggers callbacks", async () => {
    const onAccess = vi.fn();
    const user = userEvent.setup();
    render(<WorkspaceList workspaces={workspaces} onAccess={onAccess} />);

    expect(screen.getByText("General Workspace")).toBeInTheDocument();

    await user.click(screen.getAllByRole("button", { name: /accéder/i })[0]);
    expect(onAccess).toHaveBeenCalledWith(workspaces[0]);
  });
});
