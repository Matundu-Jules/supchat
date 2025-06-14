import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';
import { useSocket } from '../useSocket';
import '../../tests/setup';

describe('useSocket', () => {
  it('initialises socket.io connection', () => {
    const { result } = renderHook(() => useSocket('ch1'));
    expect(result.current).toBeTruthy();
  });
});
