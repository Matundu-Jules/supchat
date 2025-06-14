const request = require("supertest");
const { app } = require("../../src/app");

describe("Security headers", () => {
  it("sets CORS headers", async () => {
    const res = await request(app).options("/api/workspaces");
    expect(res.headers["access-control-allow-origin"]).toBeDefined();
  });
});
