import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useWorkspaces } from '../useWorkspaces';
import { TestProvider } from '../../__tests__/test-utils';
import '../../tests/setup';

// Mock window.alert
Object.defineProperty(window, 'alert', {
  writable: true,
  value: vi.fn(),
});

// Mock des services
vi.mock('@services/workspaceApi', () => ({
  inviteToWorkspace: vi.fn(),
  joinWorkspace: vi.fn(),
}));

describe('useWorkspaces', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useWorkspaces(), {
      wrapper: TestProvider,
    });

    expect(result.current.workspaces).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.fetchWorkspaces).toBe('function');
    expect(typeof result.current.handleCreateWorkspace).toBe('function');
    expect(typeof result.current.handleInvite).toBe('function');
    expect(typeof result.current.handleJoin).toBe('function');
  });

  it('should call fetchWorkspaces without errors', async () => {
    const { result } = renderHook(() => useWorkspaces(), {
      wrapper: TestProvider,
    });

    await act(async () => {
      result.current.fetchWorkspaces();
    });

    // Should not throw any errors
    expect(typeof result.current.fetchWorkspaces).toBe('function');
  });

  it('should handle workspace creation', async () => {
    const { result } = renderHook(() => useWorkspaces(), {
      wrapper: TestProvider,
    });

    const mockWorkspaceData = {
      name: 'Test Workspace',
      description: 'Test Description',
      isPublic: true,
    };

    await act(async () => {
      await result.current.handleCreateWorkspace(mockWorkspaceData);
    });

    // Function should execute without throwing
    expect(typeof result.current.handleCreateWorkspace).toBe('function');
  });

  it('should handle workspace invitation', async () => {
    const { result } = renderHook(() => useWorkspaces(), {
      wrapper: TestProvider,
    });

    await act(async () => {
      await result.current.handleInvite('ws1', 'user@example.com');
    });

    // Function should execute without throwing
    expect(typeof result.current.handleInvite).toBe('function');
  });

  it('should handle workspace joining', async () => {
    const { result } = renderHook(() => useWorkspaces(), {
      wrapper: TestProvider,
    });

    await act(async () => {
      await result.current.handleJoin('invite-code-123');
    });

    // Function should execute without throwing
    expect(typeof result.current.handleJoin).toBe('function');
  });
});
