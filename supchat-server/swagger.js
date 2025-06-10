// swagger.js
const swaggerAutogen = require('swagger-autogen')({ openapi: '3.0.0' })

const doc = {
    info: { title: 'SUPCHAT API', description: 'Chat + Workspaces' },
    servers: [{ url: 'http://localhost:3000' }],
    tags: [
        { name: 'Auth', description: 'Register / Login / Tokens' },
        { name: 'Workspaces', description: 'Workspaces CRUD' },
        { name: 'Channels', description: 'Channels CRUD' },
        { name: 'Messages', description: 'Chat messages' },
    ],
}

const outputFile = './public/swagger/swagger-output.json'
const endpointsFiles = ['./src/app.js']

swaggerAutogen(outputFile, endpointsFiles, doc)
