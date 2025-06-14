const request = require("supertest");
const { app } = require("../../src/app");
const Workspace = require("../../models/Workspace");
const User = require("../../models/User");
const { workspaceFactory } = require("../factories/workspaceFactory");
const { userFactory } = require("../factories/userFactory");

describe("POST /workspaces", () => {
  it("creates workspace when admin", async () => {
    const res = await request(app)
      .post("/api/workspaces")
      .set("Authorization", `Bearer ${global.tokens.admin}`)
      .send({ name: "Test Workspace" });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe("Test Workspace");
  });

  it("forbids member", async () => {
    const res = await request(app)
      .post("/api/workspaces")
      .set("Authorization", `Bearer ${global.tokens.member}`)
      .send({ name: "Fail" });

    expect(res.status).toBe(403);
  });
});

describe("POST /workspaces/:id/invite", () => {
  it("invite user and send WebSocket notification", async () => {
    const workspace = await Workspace.create(
      workspaceFactory({ owner: global.adminId })
    );
    const invitedUser = await User.create(userFactory());
    const emitSpy = jest.spyOn(global.socketClient, "emit");

    const res = await request(app)
      .post(`/api/workspaces/${workspace._id}/invite`)
      .set("Authorization", `Bearer ${global.tokens.admin}`)
      .send({ email: invitedUser.email });

    expect(res.status).toBe(200);
    expect(emitSpy).toHaveBeenCalledWith(
      `user_${invitedUser._id}`,
      "notification",
      expect.objectContaining({ type: "workspace_invite" })
    );
  });

  it("returns 403 for non admin", async () => {
    const workspace = await Workspace.create(
      workspaceFactory({ owner: global.adminId })
    );
    const user = await User.create(userFactory());

    const res = await request(app)
      .post(`/api/workspaces/${workspace._id}/invite`)
      .set("Authorization", `Bearer ${global.tokens.member}`)
      .send({ email: user.email });

    expect(res.status).toBe(403);
  });
});
