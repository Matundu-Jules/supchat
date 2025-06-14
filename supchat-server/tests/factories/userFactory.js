const { faker } = require("@faker-js/faker");

const userFactory = (overrides = {}) => ({
  name: faker.person.fullName(),
  email: faker.internet.email(),
  password: "pass",
  role: "membre",
  ...overrides,
});

module.exports = { userFactory };
