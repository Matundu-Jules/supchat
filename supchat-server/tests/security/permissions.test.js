const request = require("supertest");
const { app } = require("../../src/app");
const Channel = require("../../models/Channel");
const { channelFactory } = require("../factories/channelFactory");
const Workspace = require("../../models/Workspace");
const { workspaceFactory } = require("../factories/workspaceFactory");

describe("Private channel access", () => {
  it("allows member of channel", async () => {
    const workspace = await Workspace.create(
      workspaceFactory({ owner: global.adminId, members: [global.adminId] })
    );
    const channel = await Channel.create(
      channelFactory({ workspace: workspace._id, type: "private", members: [global.adminId] })
    );

    const res = await request(app)
      .get(`/api/channels/${channel._id}`)
      .set("Authorization", `Bearer ${global.tokens.admin}`);

    expect(res.status).toBe(200);
  });

  it("denies non member", async () => {
    const workspace = await Workspace.create(
      workspaceFactory({ owner: global.adminId, members: [global.adminId] })
    );
    const channel = await Channel.create(
      channelFactory({ workspace: workspace._id, type: "private", members: [] })
    );

    const res = await request(app)
      .get(`/api/channels/${channel._id}`)
      .set("Authorization", `Bearer ${global.tokens.member}`);

    expect(res.status).toBe(403);
  });
});
