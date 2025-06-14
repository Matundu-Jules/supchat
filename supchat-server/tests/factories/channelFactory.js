const { faker } = require("@faker-js/faker");

const channelFactory = (overrides = {}) => ({
  name: faker.word.words({ count: { min: 1, max: 3 } }),
  description: faker.lorem.sentence(),
  workspace: overrides.workspace,
  type: "public",
  members: [],
  invitations: [],
  messages: [],
  ...overrides,
});

module.exports = { channelFactory };
