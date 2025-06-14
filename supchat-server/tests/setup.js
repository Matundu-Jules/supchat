const mongoose = require("mongoose");
process.env.NODE_ENV = "test";
const { MongoMemoryServer } = require("mongodb-memory-server");
const ioClient = require("socket.io-client");
const jwt = require("jsonwebtoken");
const { faker } = require("@faker-js/faker");

const User = require("../models/User");
const Workspace = require("../models/Workspace");
const Channel = require("../models/Channel");
const Message = require("../models/Message");

const { userFactory } = require("./factories/userFactory");
const { workspaceFactory } = require("./factories/workspaceFactory");
const { channelFactory } = require("./factories/channelFactory");
const { messageFactory } = require("./factories/messageFactory");

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  // Seed users
  const admin = await User.create(userFactory({ role: "admin", password: "pass" }));
  const member = await User.create(userFactory({ role: "membre", password: "pass" }));
  const guest = await User.create(userFactory({ role: "invité", password: "pass" }));

  global.adminId = admin._id;

  // Seed workspace and channel
  const workspace = await Workspace.create(
    workspaceFactory({ owner: admin._id, members: [admin._id] })
  );
  const channel = await Channel.create(
    channelFactory({ workspace: workspace._id, members: [admin._id] })
  );
  await Message.create(
    messageFactory({ channel: channel._id, userId: admin._id })
  );

  workspace.channels.push(channel._id);
  await workspace.save();

  // JWT tokens
  process.env.JWT_SECRET = "testsecret";
  global.tokens = {
    admin: jwt.sign({ id: admin._id, role: "admin" }, process.env.JWT_SECRET),
    member: jwt.sign({ id: member._id, role: "membre" }, process.env.JWT_SECRET),
    guest: jwt.sign({ id: guest._id, role: "invité" }, process.env.JWT_SECRET),
  };

  // Socket.io client for tests
  global.socketClient = ioClient("http://localhost");
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
  await mongoServer.stop();
  global.socketClient.close();
});
