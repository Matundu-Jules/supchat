const { faker } = require("@faker-js/faker");

const workspaceFactory = (overrides = {}) => ({
  name: faker.company.name(),
  description: faker.company.catchPhrase(),
  isPublic: true,
  owner: overrides.ownerId,
  members: [],
  channels: [],
  invitations: [],
  ...overrides,
});

module.exports = { workspaceFactory };
