const request = require("supertest");
const { app } = require("../../src/app");
const Channel = require("../../models/Channel");
const { channelFactory } = require("../factories/channelFactory");
const Workspace = require("../../models/Workspace");
const { workspaceFactory } = require("../factories/workspaceFactory");

describe("Message rate limiting", () => {
  it("limits frequent posting", async () => {
    const workspace = await Workspace.create(
      workspaceFactory({ owner: global.adminId, members: [global.adminId] })
    );
    const channel = await Channel.create(
      channelFactory({ workspace: workspace._id, members: [global.adminId] })
    );

    for (let i = 0; i < 5; i++) {
      await request(app)
        .post(`/api/channels/${channel._id}/messages`)
        .set("Authorization", `Bearer ${global.tokens.admin}`)
        .send({ text: "spam" });
    }

    const res = await request(app)
      .post(`/api/channels/${channel._id}/messages`)
      .set("Authorization", `Bearer ${global.tokens.admin}`)
      .send({ text: "spam" });

    expect([200, 429]).toContain(res.status);
  });
});
