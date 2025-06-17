import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useWorkspacePageLogic } from '../useWorkspacePageLogic';
import { TestProvider } from '../../__tests__/test-utils';
import '../../tests/setup';

// Mock des services
vi.mock('@services/workspaceApi', () => ({
  updateWorkspace: vi.fn(),
  deleteWorkspace: vi.fn(),
  getUserWorkspaces: vi.fn(() => Promise.resolve([])),
  createWorkspace: vi.fn(),
  inviteToWorkspace: vi.fn(),
  joinWorkspace: vi.fn(),
}));

// Mock du router
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

// Mock du store Redux
vi.mock('react-redux', () => ({
  useDispatch: () => vi.fn(),
  useSelector: (selector: any) => {
    // Mock du state Redux pour les tests
    const mockState = {
      auth: { user: { id: 'user1', email: 'test@example.com', role: 'user' } },
      workspaces: { items: [], loading: false, error: null },
    };
    return selector(mockState);
  },
}));

describe('useWorkspacePageLogic - Workspace Update', () => {
  const mockWorkspace = {
    _id: 'ws1',
    name: 'Test Workspace',
    description: 'Original description',
    isPublic: false,
    owner: { _id: 'user1', email: 'test@example.com' },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock successful update
    (updateWorkspace as any).mockResolvedValue({
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

    // Ouvrir la modal d'édition
    await act(async () => {
      result.current.handleEdit(mockWorkspace);
    });

    // Simuler la modification des données
    const updateData = {
      name: 'Test Workspace',
      description: 'Original description',
      isPublic: true, // Changement de privé à public
    };

    // Exécuter la mise à jour
    await act(async () => {
      await result.current.handleEditWorkspace(updateData);
    });

    // Vérifier que l'API a été appelée avec les bonnes données
    expect(updateWorkspace).toHaveBeenCalledWith('ws1', updateData);
    expect(updateWorkspace).toHaveBeenCalledTimes(1);

    // Vérifier que la modal s'est fermée
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
    expect(updateWorkspace).toHaveBeenCalledWith('ws1', updateData);
    expect(updateWorkspace).toHaveBeenCalledTimes(1);

    // Vérifier que la modal s'est fermée
    expect(result.current.editModal).toBeNull();
  });

  it('should handle API errors during workspace update', async () => {
    const apiError = new Error('Network error');
    (updateWorkspace as any).mockRejectedValue(apiError);

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
    expect(updateWorkspace).toHaveBeenCalledWith('ws1', updateData);
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
    expect(updateWorkspace).not.toHaveBeenCalled();
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
    expect(updateWorkspace).not.toHaveBeenCalled();
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
    expect(updateWorkspace).toHaveBeenCalledWith('ws1', updateData);
    expect(updateWorkspace).toHaveBeenCalledTimes(1);

    // Vérifier que la modal s'est fermée
    expect(result.current.editModal).toBeNull();
  });
});
