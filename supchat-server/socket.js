const { Server } = require("socket.io");

let io;

function initSocket(server, allowedOrigins = ["http://localhost:5173", "http://localhost:3000"]) {
  io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    socket.on("joinChannel", (channelId) => {
      if (channelId) socket.join(channelId);
    });

    socket.on("leaveChannel", (channelId) => {
      if (channelId) socket.leave(channelId);
    });

    socket.on("subscribeNotifications", (userId) => {
      if (userId) socket.join(`user_${userId}`);
    });

    socket.on("unsubscribeNotifications", (userId) => {
      if (userId) socket.leave(`user_${userId}`);
    });
  });

  return io;
}

function getIo() {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
}

module.exports = { initSocket, getIo };
