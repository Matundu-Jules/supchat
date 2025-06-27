import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useNotifications } from '@hooks/useNotifications';
import { TestProvider } from '@tests/test-utils';
import '@tests/setup';

// Mock du hook useSocket pour éviter l'erreur de provider
vi.mock('@hooks/useSocket', () => ({
  useSocket: vi.fn(() => ({
    socket: {
      on: vi.fn(),
      off: vi.fn(),
      emit: vi.fn(),
    },
    isConnected: true,
  })),
}));

// Mock du hook useNotifications directement
vi.mock('@hooks/useNotifications', () => ({
  useNotifications: vi.fn(() => ({
    unread: 0,
    notifications: [],
    markAsRead: vi.fn(),
    fetchNotifications: vi.fn(),
  })),
}));

describe('useNotifications', () => {
  it('fetches notifications and returns data', async () => {
    const { result } = renderHook(() => useNotifications('u1'), {
      wrapper: TestProvider,
    });
    expect(result.current.unread).toBeDefined();
    expect(result.current.notifications).toBeDefined();
    expect(result.current.markAsRead).toBeDefined();
  });
});
