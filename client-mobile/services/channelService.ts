// services/channelService.ts
import apiClient from '../utils/axiosConfig';
import { API_ENDPOINTS } from '../constants/api';

export interface Channel {
  _id: string;
  name: string;
  description?: string;
  workspace: string;
  type: 'public' | 'private';
}

export interface CreateChannelData {
  name: string;
  description?: string;
  workspaceId: string;
  type: 'public' | 'private';
}

export interface UpdateChannelData {
  name?: string;
  description?: string;
}

export class ChannelService {
  // Récupérer les channels d'un workspace
  static async getChannels(workspaceId: string): Promise<Channel[]> {
    try {
      const response = await apiClient.get(
        `/channels?workspaceId=${workspaceId}`
      );
      return response.data;
    } catch (error) {
      console.error('Erreur récupération channels:', error);
      throw new Error('Impossible de récupérer les channels');
    }
  }

  // Créer un channel
  static async createChannel(data: CreateChannelData): Promise<Channel> {
    try {
      const response = await apiClient.post('/channels', data);
      return response.data;
    } catch (error) {
      console.error('Erreur création channel:', error);
      throw new Error('Impossible de créer le channel');
    }
  }

  // Mettre à jour un channel
  static async updateChannel(
    channelId: string,
    data: UpdateChannelData
  ): Promise<Channel> {
    try {
      const response = await apiClient.put(`/channels/${channelId}`, data);
      return response.data;
    } catch (error) {
      console.error('Erreur mise à jour channel:', error);
      throw new Error('Impossible de mettre à jour le channel');
    }
  }

  // Supprimer un channel
  static async deleteChannel(channelId: string): Promise<void> {
    try {
      await apiClient.delete(`/channels/${channelId}`);
    } catch (error) {
      console.error('Erreur suppression channel:', error);
      throw new Error('Impossible de supprimer le channel');
    }
  }

  // Récupérer un channel par ID
  static async getChannelById(channelId: string): Promise<Channel> {
    try {
      const response = await apiClient.get(`/channels/${channelId}`);
      return response.data;
    } catch (error) {
      console.error('Erreur récupération channel:', error);
      throw new Error('Impossible de récupérer le channel');
    }
  }
}
