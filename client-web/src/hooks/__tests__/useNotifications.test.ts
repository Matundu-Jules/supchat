import { renderHook } from '@testing-library/react';
import { useNotifications } from '../useNotifications';
import '../../tests/setup';

describe('useNotifications', () => {
  it('fetches notifications and returns data', async () => {
    const { result } = renderHook(() => useNotifications('u1'));
    expect(result.current.unread).toBeDefined();
  });
});
