const request = require("supertest");
const app = require("../src/app");
const Channel = require("../models/Channel");

describe("Test des routes Channel", () => {
  let channelId;
  const workspaceId = "507f191e810c19729de860ea";

  it("Crée un nouveau canal", async () => {
    const res = await request(app).post("/api/channels").send({
      name: "Général",
      type: "public",
      workspaceId: "507f191e810c19729de860ea",
    });

    expect(res.statusCode).toBe(201);
    channelId = res.body.channel._id;
  });

  it("Filtre les canaux par workspace", async () => {
    await Channel.create({ name: "Filtre", type: "public", workspace: workspaceId });

    const res = await request(app).get(`/api/channels?workspaceId=${workspaceId}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some((c) => c.workspace === workspaceId)).toBe(true);
  });

  it("Met à jour un canal", async () => {
    const res = await request(app)
      .put(`/api/channels/${channelId}`)
      .send({ name: "Général 2" });
    expect(res.statusCode).toBe(200);
  });

  it("Récupère un canal", async () => {
    const res = await request(app).get(`/api/channels/${channelId}`);
    expect(res.statusCode).toBe(200);
  });

  it("Supprime un canal", async () => {
    const res = await request(app).delete(`/api/channels/${channelId}`);
    expect(res.statusCode).toBe(200);
  });
});
