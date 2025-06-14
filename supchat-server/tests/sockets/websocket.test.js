const io = require("socket.io-client");
const { server } = require("../../src/app");

describe("WebSocket interactions", () => {
  let client;

  beforeEach((done) => {
    client = io("http://localhost", { forceNew: true });
    client.on("connect", done);
  });

  afterEach(() => {
    if (client.connected) client.disconnect();
  });

  it("connects to personal room", (done) => {
    client.emit("subscribeNotifications", "123");
    client.on("joined", () => {
      done();
    });
  });

  it("receives invitation notification", (done) => {
    client.on("notification", (payload) => {
      try {
        expect(payload.type).toBe("workspace_invite");
        done();
      } catch (e) {
        done(e);
      }
    });

    server.emit("notification", {
      room: "user_123",
      type: "workspace_invite",
    });
  });
});
