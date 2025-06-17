// services/messageService.ts
import apiClient from '../utils/axiosConfig';

export interface Message {
  _id: string;
  text?: string;
  file?: string;
  userId: {
    _id: string;
    username: string;
  };
  channelId: string;
  createdAt: string;
  updatedAt?: string;
}

export interface SendMessageData {
  channelId: string;
  text?: string;
  file?: File;
}

export class MessageService {
  // Récupérer les messages d'un channel
  static async getMessages(channelId: string): Promise<Message[]> {
    try {
      const response = await apiClient.get(`/messages/channel/${channelId}`);
      return response.data;
    } catch (error) {
      console.error('Erreur récupération messages:', error);
      throw new Error('Impossible de récupérer les messages');
    }
  }

  // Envoyer un message
  static async sendMessage(data: SendMessageData): Promise<Message> {
    try {
      const formData = new FormData();
      formData.append('channelId', data.channelId);

      if (data.text) {
        formData.append('text', data.text);
      }

      if (data.file) {
        formData.append('file', data.file);
      }

      const response = await apiClient.post('/messages', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Erreur envoi message:', error);
      throw new Error("Impossible d'envoyer le message");
    }
  }

  // Mettre à jour un message
  static async updateMessage(
    messageId: string,
    text: string
  ): Promise<Message> {
    try {
      const response = await apiClient.put(`/messages/${messageId}`, { text });
      return response.data;
    } catch (error) {
      console.error('Erreur mise à jour message:', error);
      throw new Error('Impossible de mettre à jour le message');
    }
  }

  // Supprimer un message
  static async deleteMessage(messageId: string): Promise<void> {
    try {
      await apiClient.delete(`/messages/${messageId}`);
    } catch (error) {
      console.error('Erreur suppression message:', error);
      throw new Error('Impossible de supprimer le message');
    }
  }
}
