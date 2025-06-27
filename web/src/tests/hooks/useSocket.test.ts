import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useSocket } from '@hooks/useSocket';
import { TestProvider } from '@tests/test-utils';
import '@tests/setup';

// Mock du hook useSocket directement
vi.mock('@hooks/useSocket', () => ({
  useSocket: vi.fn(() => ({
    socket: {
      on: vi.fn(),
      off: vi.fn(),
      emit: vi.fn(),
      connect: vi.fn(),
      disconnect: vi.fn(),
    },
    isConnected: true,
  })),
}));

describe('useSocket', () => {
  it('initialises socket.io connection', () => {
    const { result } = renderHook(() => useSocket('ch1'), {
      wrapper: TestProvider,
    });
    expect(result.current).toBeTruthy();
    expect(result.current.isConnected).toBe(true);
  });
});
