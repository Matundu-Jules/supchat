import { renderHook, act } from '@testing-library/react';
import { useAuth } from '../useAuth';
import '../../tests/setup';

describe('useAuth', () => {
  it('logs in user via hook', async () => {
    const { result } = renderHook(() => useAuth());
    await act(async () => {
      await result.current.login('user@example.com', 'secret');
    });
    expect(localStorage.getItem('token')).toBe('jwt');
  });
});
