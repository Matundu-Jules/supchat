const { faker } = require('@faker-js/faker')
const mongoose = require('mongoose')

const channelFactory = (overrides = {}) => ({
    name: faker.word.words({ count: { min: 1, max: 3 } }),
    description: faker.lorem.sentence(),
    workspace: overrides.workspace || new mongoose.Types.ObjectId(),
    type: 'public',
    createdBy: overrides.createdBy || new mongoose.Types.ObjectId(),
    members: [],
    invitations: [],
    messages: [],
    ...overrides,
})

module.exports = { channelFactory }
