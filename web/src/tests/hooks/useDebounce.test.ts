import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import useDebounce from '@hooks/useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500));

    expect(result.current).toBe('initial');
  });
  it('should debounce value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 500 },
      }
    );

    // Initial value should be returned immediately
    expect(result.current).toBe('initial');

    // Change the value
    rerender({ value: 'changed', delay: 500 });

    // Value should still be the initial value before timeout
    expect(result.current).toBe('initial');

    // Fast forward time by 250ms (not enough to trigger debounce)
    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(result.current).toBe('initial');

    // Fast forward remaining time to complete the debounce delay
    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(result.current).toBe('changed');
  });
  it('should reset timer on rapid value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 500 },
      }
    );

    expect(result.current).toBe('initial');

    // Change value multiple times rapidly
    rerender({ value: 'change1', delay: 500 });
    act(() => {
      vi.advanceTimersByTime(200);
    });

    rerender({ value: 'change2', delay: 500 });
    act(() => {
      vi.advanceTimersByTime(200);
    });

    rerender({ value: 'final', delay: 500 });

    // Value should still be initial because timer keeps getting reset
    expect(result.current).toBe('initial');

    // Now wait for the full delay
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Should show the final value
    expect(result.current).toBe('final');
  });
  it('should handle different delay values', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 1000 },
      }
    );

    rerender({ value: 'changed', delay: 1000 });

    // Should not change after 500ms (delay is 1000ms)
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current).toBe('initial');

    // Should change after 1000ms
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current).toBe('changed');
  });
  it('should handle zero delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 0 },
      }
    );

    act(() => {
      rerender({ value: 'changed', delay: 0 });
    });

    // With zero delay, should update immediately on next tick
    act(() => {
      vi.advanceTimersByTime(0);
    });
    expect(result.current).toBe('changed');
  });
  it('should use default delay when not provided', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value), {
      initialProps: { value: 'initial' },
    });

    act(() => {
      rerender({ value: 'changed' });
    });

    // Should not change before default delay (300ms)
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current).toBe('initial');

    // Should change after default delay
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current).toBe('changed');
  });
  it('should work with non-string values', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 42, delay: 300 },
      }
    );

    expect(result.current).toBe(42);

    act(() => {
      rerender({ value: 100, delay: 300 });
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe(100);
  });
  it('should work with object values', () => {
    const initialObj = { name: 'John', age: 25 };
    const changedObj = { name: 'Jane', age: 30 };

    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: initialObj, delay: 400 },
      }
    );

    expect(result.current).toBe(initialObj);

    act(() => {
      rerender({ value: changedObj, delay: 400 });
    });

    act(() => {
      vi.advanceTimersByTime(400);
    });

    expect(result.current).toBe(changedObj);
  });
});
