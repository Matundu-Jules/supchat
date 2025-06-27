vi.mock('@services/workspaceApi', () => {
  const mockUpdateWorkspace = vi.fn();
  const mockDeleteWorkspace = vi.fn();
  const mockGetUserWorkspaces = vi.fn(() => Promise.resolve([]));
  const mockCreateWorkspace = vi.fn();
  const mockInviteToWorkspace = vi.fn();
  const mockJoinWorkspace = vi.fn();
  const mockGetWorkspaceMembers = vi.fn(() => Promise.resolve([]));

  return {
    updateWorkspace: mockUpdateWorkspace,
    deleteWorkspace: mockDeleteWorkspace,
    getUserWorkspaces: mockGetUserWorkspaces,
    createWorkspace: mockCreateWorkspace,
    inviteToWorkspace: mockInviteToWorkspace,
    joinWorkspace: mockJoinWorkspace,
    getWorkspaceMembers: mockGetWorkspaceMembers,
    __mocks: {
      mockUpdateWorkspace,
      mockDeleteWorkspace,
      mockGetUserWorkspaces,
      mockCreateWorkspace,
      mockInviteToWorkspace,
      mockJoinWorkspace,
      mockGetWorkspaceMembers,
    },
  };
});

import * as workspaceApi from '@services/workspaceApi';
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useWorkspacePageLogic } from '@hooks/useWorkspacePageLogic';
import { TestProvider } from '@tests/test-utils';
import '@tests/setup';

// Mock du router (mock partiel pour garder MemoryRouter)
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return Object.assign({}, actual, {
    useNavigate: () => vi.fn(),
  });
});

describe('useWorkspacePageLogic - Workspace Update', () => {
  const mockWorkspace = {
    _id: 'ws1',
    name: 'Test Workspace',
    description: 'Original description',
    isPublic: false,
    owner: { _id: 'user1', email: 'test@example.com' },
  };

  const { mockUpdateWorkspace } = (workspaceApi as any).__mocks;

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock successful update
    mockUpdateWorkspace.mockResolvedValue({
      message: 'Workspace updated',
      workspace: {
        ...mockWorkspace,
        name: 'Updated Workspace',
        isPublic: true,
      },
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should initialize edit modal correctly', () => {
    const { result } = renderHook(() => useWorkspacePageLogic(), {
      wrapper: TestProvider,
    });

    expect(result.current.editModal).toBeNull();
    expect(typeof result.current.handleEdit).toBe('function');
    expect(typeof result.current.handleEditWorkspace).toBe('function');
  });

  it('should open edit modal with workspace data', async () => {
    const { result } = renderHook(() => useWorkspacePageLogic(), {
      wrapper: TestProvider,
    });

    await act(async () => {
      result.current.handleEdit(mockWorkspace);
    });

    expect(result.current.editModal).toEqual({
      id: 'ws1',
      name: 'Test Workspace',
      description: 'Original description',
      isPublic: false,
    });
  });

  it('should successfully update workspace privacy from private to public', async () => {
    const { result } = renderHook(() => useWorkspacePageLogic(), {
      wrapper: TestProvider,
    });
    await act(async () => {
      result.current.handleEdit(mockWorkspace);
    });
    const updateData = {
      name: 'Test Workspace',
      description: 'Original description',
      isPublic: true,
    };
    await act(async () => {
      await result.current.handleEditWorkspace(updateData);
    });
    expect(mockUpdateWorkspace).toHaveBeenCalledWith('ws1', updateData);
    expect(mockUpdateWorkspace).toHaveBeenCalledTimes(1);
    expect(result.current.editModal).toBeNull();
  });

  it('should successfully update workspace privacy from public to private', async () => {
    const publicWorkspace = { ...mockWorkspace, isPublic: true };
    const { result } = renderHook(() => useWorkspacePageLogic(), {
      wrapper: TestProvider,
    });

    // Ouvrir la modal d'édition avec un workspace public
    await act(async () => {
      result.current.handleEdit(publicWorkspace);
    });

    // Simuler la modification des données
    const updateData = {
      name: 'Test Workspace',
      description: 'Original description',
      isPublic: false, // Changement de public à privé
    };

    // Exécuter la mise à jour
    await act(async () => {
      await result.current.handleEditWorkspace(updateData);
    });

    // Vérifier que l'API a été appelée avec les bonnes données
    expect(mockUpdateWorkspace).toHaveBeenCalledWith('ws1', updateData);
    expect(mockUpdateWorkspace).toHaveBeenCalledTimes(1);

    // Vérifier que la modal s'est fermée
    expect(result.current.editModal).toBeNull();
  });

  it('should handle API errors during workspace update', async () => {
    const apiError = new Error('Network error');
    (workspaceApi.updateWorkspace as any).mockRejectedValue(apiError);

    const { result } = renderHook(() => useWorkspacePageLogic(), {
      wrapper: TestProvider,
    });

    // Ouvrir la modal d'édition
    await act(async () => {
      result.current.handleEdit(mockWorkspace);
    });

    const updateData = {
      name: 'Test Workspace',
      description: 'Original description',
      isPublic: true,
    };

    // Exécuter la mise à jour qui devrait échouer
    await act(async () => {
      await expect(
        result.current.handleEditWorkspace(updateData)
      ).rejects.toThrow('Network error');
    });

    // Vérifier que l'API a été appelée
    expect(mockUpdateWorkspace).toHaveBeenCalledWith('ws1', updateData);
  });

  it('should validate workspace name before update', async () => {
    const { result } = renderHook(() => useWorkspacePageLogic(), {
      wrapper: TestProvider,
    });

    // Ouvrir la modal d'édition
    await act(async () => {
      result.current.handleEdit(mockWorkspace);
    });

    // Essayer de mettre à jour avec un nom vide
    const invalidData = {
      name: '', // Nom vide
      description: 'Original description',
      isPublic: true,
    };

    // Exécuter la mise à jour qui devrait échouer
    await act(async () => {
      await expect(
        result.current.handleEditWorkspace(invalidData)
      ).rejects.toThrow();
    });

    // Vérifier que l'API n'a pas été appelée
    expect(mockUpdateWorkspace).not.toHaveBeenCalled();
  });

  it('should validate workspace name length', async () => {
    const { result } = renderHook(() => useWorkspacePageLogic(), {
      wrapper: TestProvider,
    });

    // Ouvrir la modal d'édition
    await act(async () => {
      result.current.handleEdit(mockWorkspace);
    });

    // Essayer de mettre à jour avec un nom trop court
    const invalidData = {
      name: 'ab', // Nom trop court (moins de 3 caractères)
      description: 'Original description',
      isPublic: true,
    };

    // Exécuter la mise à jour qui devrait échouer
    await act(async () => {
      await expect(
        result.current.handleEditWorkspace(invalidData)
      ).rejects.toThrow();
    });

    // Vérifier que l'API n'a pas été appelée
    expect(mockUpdateWorkspace).not.toHaveBeenCalled();
  });

  it('should handle workspace update with all fields', async () => {
    const { result } = renderHook(() => useWorkspacePageLogic(), {
      wrapper: TestProvider,
    });

    // Ouvrir la modal d'édition
    await act(async () => {
      result.current.handleEdit(mockWorkspace);
    });

    // Simuler la modification de tous les champs
    const updateData = {
      name: 'Completely New Name',
      description: 'Completely new description',
      isPublic: true,
    };

    // Exécuter la mise à jour
    await act(async () => {
      await result.current.handleEditWorkspace(updateData);
    });

    // Vérifier que l'API a été appelée avec toutes les données
    expect(mockUpdateWorkspace).toHaveBeenCalledWith('ws1', updateData);
    expect(mockUpdateWorkspace).toHaveBeenCalledTimes(1);

    // Vérifier que la modal s'est fermée
    expect(result.current.editModal).toBeNull();
  });
});
