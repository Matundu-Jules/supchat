const request = require("supertest");
const app = require("../src/app");
const Channel = require("../models/Channel");

describe("Test des routes Channel", () => {
  let channelId;
  const workspaceId = "507f191e810c19729de860ea";

  it("Renvoie 401 lors de la création sans authentification", async () => {
    const res = await request(app).post("/api/channels").send({
      name: "Général",
      type: "public",
      workspaceId,
    });

    expect(res.statusCode).toBe(401);
  });

  it("Renvoie 401 lors du filtrage sans authentification", async () => {
    await Channel.create({ name: "Filtre", type: "public", workspace: workspaceId });

    const res = await request(app).get(`/api/channels?workspaceId=${workspaceId}`);

    expect(res.statusCode).toBe(401);
  });

  it("Renvoie 401 lors de la mise à jour sans authentification", async () => {
    const fakeId = "64b9f1fae1f1f1f1f1f1f1f1";
    const res = await request(app)
      .put(`/api/channels/${fakeId}`)
      .send({ name: "Général 2" });
    expect(res.statusCode).toBe(401);
  });

  it("Renvoie 401 lors de la récupération sans authentification", async () => {
    const fakeId = "64b9f1fae1f1f1f1f1f1f1f1";
    const res = await request(app).get(`/api/channels/${fakeId}`);
    expect(res.statusCode).toBe(401);
  });

  it("Renvoie 401 lors de la suppression sans authentification", async () => {
    const fakeId = "64b9f1fae1f1f1f1f1f1f1f1";
    const res = await request(app).delete(`/api/channels/${fakeId}`);
    expect(res.statusCode).toBe(401);
  });
});
