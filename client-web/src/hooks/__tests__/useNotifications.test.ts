import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useNotifications } from '../useNotifications';
import { TestProvider } from '../../__tests__/test-utils';
import '../../tests/setup';

describe('useNotifications', () => {
  it('fetches notifications and returns data', async () => {
    const { result } = renderHook(() => useNotifications('u1'), {
      wrapper: TestProvider,
    });
    expect(result.current.unread).toBeDefined();
  });
});
