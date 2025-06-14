const { faker } = require("@faker-js/faker");

const messageFactory = (overrides = {}) => ({
  text: faker.lorem.sentence(),
  channel: overrides.channel,
  userId: overrides.userId,
  createdAt: new Date(),
  ...overrides,
});

module.exports = { messageFactory };
