import '@testing-library/jest-dom';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { beforeAll, afterAll, afterEach, vi } from 'vitest';
import { workspaces } from './fixtures/workspaces';
import { channels } from './fixtures/channels';
import { messages } from './fixtures/messages';
import { notifications } from './fixtures/notifications';
import { users } from './fixtures/users';

export const handlers = [
  // Auth endpoints
  http.post('/api/auth/login', () => {
    return HttpResponse.json({
      token: 'mock-jwt-token',
      user: users[0],
    });
  }),

  http.post('/api/auth/register', () => {
    return HttpResponse.json({
      token: 'mock-jwt-token',
      user: users[0],
    });
  }),

  http.get('/api/csrf-token', () => {
    return HttpResponse.json({ token: 'mock-csrf-token' });
  }),

  // Workspaces
  http.get('/api/workspaces', () => {
    return HttpResponse.json(workspaces);
  }),

  http.post('/api/workspaces', () => {
    return HttpResponse.json(workspaces[0]);
  }),

  // Channels
  http.get('/api/channels', () => {
    return HttpResponse.json(channels);
  }),

  http.get('/api/channels/:workspaceId', () => {
    return HttpResponse.json(channels);
  }),

  // Messages
  http.get('/api/messages/channel/:id', () => {
    return HttpResponse.json(messages);
  }),

  http.post('/api/messages', () => {
    return HttpResponse.json(messages[0]);
  }),

  // Notifications
  http.get('/api/notifications', () => {
    return HttpResponse.json(notifications);
  }),

  // Search
  http.get('/api/search', () => {
    return HttpResponse.json({
      messages: messages.slice(0, 2),
      channels: channels.slice(0, 1),
      files: [],
    });
  }),

  // Users
  http.get('/api/users/me', () => {
    return HttpResponse.json(users[0]);
  }),
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
    default: () => ({
      on: vi.fn(),
      emit: vi.fn(),
      off: vi.fn(),
      disconnect: vi.fn(),
    }),
    io: () => ({
      on: vi.fn(),
      emit: vi.fn(),
      off: vi.fn(),
      disconnect: vi.fn(),
    }),
  };
});

// Mock du store Redux pour éviter les erreurs
vi.mock('../store', () => ({
  store: {
    getState: () => ({
      auth: { user: null, token: null },
      workspaces: { current: null, list: [] },
      channels: { current: null, list: [] },
      messages: { list: [] },
      notifications: { list: [] },
    }),
    dispatch: vi.fn(),
    subscribe: vi.fn(),
  },
}));
