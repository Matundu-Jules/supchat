// services/workspaceService.ts
import apiClient from '../utils/axiosConfig';

export interface Workspace {
  _id: string;
  name: string;
  description?: string;
  members: string[];
  isPublic: boolean;
}

export interface CreateWorkspaceData {
  name: string;
  description?: string;
  isPublic?: boolean;
}

export interface UpdateWorkspaceData {
  name?: string;
  description?: string;
  isPublic?: boolean;
}

export class WorkspaceService {
  // Récupérer tous les workspaces de l'utilisateur
  static async getWorkspaces(): Promise<Workspace[]> {
    try {
      const response = await apiClient.get('/workspaces');
      return response.data;
    } catch (error) {
      console.error('Erreur récupération workspaces:', error);
      throw new Error('Impossible de récupérer les workspaces');
    }
  }

  // Créer un workspace
  static async createWorkspace(data: CreateWorkspaceData): Promise<Workspace> {
    try {
      const response = await apiClient.post('/workspaces', data);
      return response.data;
    } catch (error) {
      console.error('Erreur création workspace:', error);
      throw new Error('Impossible de créer le workspace');
    }
  }

  // Mettre à jour un workspace
  static async updateWorkspace(
    workspaceId: string,
    data: UpdateWorkspaceData
  ): Promise<Workspace> {
    try {
      const response = await apiClient.put(`/workspaces/${workspaceId}`, data);
      return response.data;
    } catch (error) {
      console.error('Erreur mise à jour workspace:', error);
      throw new Error('Impossible de mettre à jour le workspace');
    }
  }

  // Supprimer un workspace
  static async deleteWorkspace(workspaceId: string): Promise<void> {
    try {
      await apiClient.delete(`/workspaces/${workspaceId}`);
    } catch (error) {
      console.error('Erreur suppression workspace:', error);
      throw new Error('Impossible de supprimer le workspace');
    }
  }

  // Récupérer un workspace par ID
  static async getWorkspaceById(workspaceId: string): Promise<Workspace> {
    try {
      const response = await apiClient.get(`/workspaces/${workspaceId}`);
      return response.data;
    } catch (error) {
      console.error('Erreur récupération workspace:', error);
      throw new Error('Impossible de récupérer le workspace');
    }
  }

  // Inviter un utilisateur dans un workspace
  static async inviteToWorkspace(
    workspaceId: string,
    email: string
  ): Promise<void> {
    try {
      await apiClient.post(`/workspaces/${workspaceId}/invite`, { email });
    } catch (error) {
      console.error('Erreur invitation workspace:', error);
      throw new Error("Impossible d'inviter l'utilisateur");
    }
  }
}
