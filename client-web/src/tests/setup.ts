import '@testing-library/jest-dom';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { beforeAll, afterAll, afterEach } from 'vitest';
import { workspaces } from './fixtures/workspaces';
import { channels } from './fixtures/channels';
import { messages } from './fixtures/messages';

export const handlers = [
  rest.get('/api/workspaces', (_req, res, ctx) => res(ctx.json(workspaces))),
  rest.get('/api/channels', (_req, res, ctx) => res(ctx.json(channels))),
  rest.get('/api/messages/channel/:id', (_req, res, ctx) => res(ctx.json(messages))),
  rest.post('/api/auth/login', (_req, res, ctx) =>
    res(ctx.json({ token: 'jwt', user: { email: 'test@test.com' } }))
  ),
];

const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

Object.defineProperty(window, 'localStorage', {
  value: (function () {
    let store: Record<string, string> = {};
    return {
      getItem: (k: string) => store[k] || null,
      setItem: (k: string, v: string) => {
        store[k] = String(v);
      },
      removeItem: (k: string) => {
        delete store[k];
      },
      clear: () => {
        store = {};
      },
    };
  })(),
});

vi.mock('socket.io-client', () => {
  return {
    io: () => ({
      on: vi.fn(),
      emit: vi.fn(),
      off: vi.fn(),
      disconnect: vi.fn(),
    }),
  };
});
