// swagger.js
const swaggerAutogen = require('swagger-autogen')({ openapi: '3.0.0' })

const doc = {
  info: { title: "SUPCHAT API", description: "Chat + Workspaces" },
  servers: [{ url: "http://localhost:3000" }],
  tags: [
    { name: "Auth", description: "Register / Login / Tokens" },
    { name: "Workspaces", description: "Workspaces CRUD" },
    { name: "Channels", description: "Channels CRUD" },
    { name: "Messages", description: "Chat messages" }
  ],
  components: {
    schemas: {
      Channel: {
        type: "object",
        properties: {
          _id: { type: "string", example: "64b0fded1c9e3d1a2f1a1234" },
          name: { type: "string", example: "general" },
          workspace: { type: "string", example: "64b0fded1c9e3d1a2f1a5678" },
          description: {
            type: "string",
            example: "General discussion channel"
          },
          type: {
            type: "string",
            enum: ["public", "private"],
            example: "public"
          },
          members: {
            type: "array",
            items: { type: "string" }
          },
          messages: {
            type: "array",
            items: { type: "string" }
          }
        }
      },
      ChannelCreate: {
        type: "object",
        required: ["name", "workspaceId", "type"],
        properties: {
          name: { type: "string", example: "support" },
          workspaceId: {
            type: "string",
            example: "64b0fded1c9e3d1a2f1a5678"
          },
          description: { type: "string", example: "Support channel" },
          type: {
            type: "string",
            enum: ["public", "private"],
            example: "public"
          }
        }
      },
      ChannelUpdate: {
        type: "object",
        properties: {
          name: { type: "string", example: "support" },
          description: { type: "string", example: "New description" }
        }
      }
    }
  },
  paths: {
    "/api/channels": {
      post: {
        tags: ["Channels"],
        description: "Create a channel",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ChannelCreate" }
            }
          }
        },
        responses: {
          201: {
            description: "Created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Channel" }
              }
            }
          }
        }
      },
      get: {
        tags: ["Channels"],
        description: "List channels of a workspace",
        parameters: [
          {
            name: "workspaceId",
            in: "query",
            required: true,
            schema: { type: "string" }
          }
        ],
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Channel" }
                }
              }
            }
          }
        }
      }
    },
    "/api/channels/{id}": {
      get: {
        tags: ["Channels"],
        description: "Get channel by id",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } }
        ],
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Channel" }
              }
            }
          },
          404: { description: "Not Found" }
        }
      },
      put: {
        tags: ["Channels"],
        description: "Update channel",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ChannelUpdate" }
            }
          }
        },
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Channel" }
              }
            }
          },
          404: { description: "Not Found" }
        }
      },
      delete: {
        tags: ["Channels"],
        description: "Delete channel",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } }
        ],
        responses: {
          200: { description: "OK" },
          404: { description: "Not Found" }
        }
      }
    }
  }
}

const outputFile = './public/swagger/swagger-output.json'
const endpointsFiles = ['./src/app.js']

swaggerAutogen(outputFile, endpointsFiles, doc)
