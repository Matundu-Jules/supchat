const request = require("supertest");
const app = require("../src/app");

describe("Test des routes Utilisateurs", () => {
  it("Crée un utilisateur", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Jean Dupont",
      email: "jean@example.com",
      password: "password123",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.email).toBe("jean@example.com");
  });

  it("Connecte un utilisateur", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "jean@example.com",
      password: "password123",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
  });
});
