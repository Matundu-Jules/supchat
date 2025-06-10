const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const dotenv = require("dotenv");
let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected"));
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});
