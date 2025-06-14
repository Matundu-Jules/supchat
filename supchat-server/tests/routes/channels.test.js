const request = require("supertest");
const { app } = require("../../src/app");
const Channel = require("../../models/Channel");
const Workspace = require("../../models/Workspace");
const User = require("../../models/User");
const Message = require("../../models/Message");
const { channelFactory } = require("../factories/channelFactory");
const { workspaceFactory } = require("../factories/workspaceFactory");
const { userFactory } = require("../factories/userFactory");
const { messageFactory } = require("../factories/messageFactory");

describe("Channel routes", () => {
  let workspace;
  beforeEach(async () => {
    workspace = await Workspace.create(
      workspaceFactory({ owner: global.adminId, members: [global.adminId] })
    );
  });

  describe("POST /channels", () => {
    it("creates channel", async () => {
      const res = await request(app)
        .post("/api/channels")
        .set("Authorization", `Bearer ${global.tokens.admin}`)
        .send({ name: "my channel", workspaceId: workspace._id, type: "public" });

      expect(res.status).toBe(201);
      expect(res.body.name).toBe("my channel");
    });

    it("denies guest", async () => {
      const res = await request(app)
        .post("/api/channels")
        .set("Authorization", `Bearer ${global.tokens.guest}`)
        .send({ name: "guest", workspaceId: workspace._id, type: "public" });

      expect(res.status).toBe(403);
    });
  });

  describe("GET /channels/:id/messages", () => {
    it("returns channel messages", async () => {
      const channel = await Channel.create(
        channelFactory({ workspace: workspace._id })
      );
      const msg = await Message.create(
        messageFactory({ channel: channel._id, userId: global.adminId })
      );

      const res = await request(app)
        .get(`/api/channels/${channel._id}/messages`)
        .set("Authorization", `Bearer ${global.tokens.admin}`);

      expect(res.status).toBe(200);
    });
  });

  describe("POST /channels/:id/messages", () => {
    it("posts message and emits socket", async () => {
      const channel = await Channel.create(
        channelFactory({ workspace: workspace._id })
      );
      const emitSpy = jest.spyOn(global.socketClient, "emit");

      const res = await request(app)
        .post(`/api/channels/${channel._id}/messages`)
        .set("Authorization", `Bearer ${global.tokens.admin}`)
        .send({ text: "hello" });

      expect(res.status).toBe(201);
      expect(emitSpy).toHaveBeenCalledWith(
        channel._id.toString(),
        "new_message",
        expect.objectContaining({ text: "hello" })
      );
    });
  });
});
