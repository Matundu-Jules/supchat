const request = require("supertest");
const app = require("../src/app");
const Channel = require("../models/Channel");

describe("Test des routes Channel", () => {
  let channelId;

  it("Crée un nouveau canal", async () => {
    const res = await request(app).post("/api/channels/create").send({
      name: "Général",
      type: "public",
      workspaceId: "1234567890",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe("Général");
    channelId = res.body._id;
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
