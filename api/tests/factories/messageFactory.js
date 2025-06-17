const { faker } = require('@faker-js/faker')

const messageFactory = (overrides = {}) => ({
    text: overrides.content || overrides.text || faker.lorem.sentence(),
    content: overrides.content || overrides.text || faker.lorem.sentence(),
    channelId: overrides.channelId || overrides.channel,
    channel: overrides.channelId || overrides.channel,
    userId: overrides.userId,
    type: overrides.type || 'text',
    createdAt: new Date(),
    ...overrides,
})

module.exports = { messageFactory }
