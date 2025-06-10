const request = require("supertest");
const app = require("../src/app");

describe("Test des routes Messages", () => {
  it("Envoie un message", async () => {
    const res = await request(app).post("/api/messages/send").send({
      content: "Bonjour tout le monde!",
      channelId: "1234567890",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.content).toBe("Bonjour tout le monde!");
  });
});
