const request = require("supertest");
const { app } = require("../../src/app");

describe("Validation middleware", () => {
  it("rejects invalid payload", async () => {
    const res = await request(app)
      .post("/api/workspaces")
      .set("Authorization", `Bearer ${global.tokens.admin}`)
      .send({});

    expect(res.status).toBe(400);
  });
});
