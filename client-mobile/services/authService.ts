import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ENDPOINTS } from '../constants/api';

export interface LoginResponse {
  token: string;
  user: {
    _id: string;
    email: string;
    username: string;
  };
}

export interface RegisterData {
  email: string;
  password: string;
  username: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export class AuthService {
  private static TOKEN_KEY =
    process.env.EXPO_PUBLIC_TOKEN_STORAGE_KEY || 'authToken';

  // Login
  static async login(data: LoginData): Promise<LoginResponse> {
    try {
      const response = await axios.post(API_ENDPOINTS.login, data);
      const result = response.data as LoginResponse;

      // Stocker le token
      await AsyncStorage.setItem(this.TOKEN_KEY, result.token);

      return result;
    } catch (error) {
      console.error('Erreur login:', error);
      throw new Error('Email ou mot de passe invalide');
    }
  }

  // Register
  static async register(data: RegisterData): Promise<LoginResponse> {
    try {
      const response = await axios.post(API_ENDPOINTS.register, data);
      const result = response.data as LoginResponse;

      // Stocker le token
      await AsyncStorage.setItem(this.TOKEN_KEY, result.token);

      return result;
    } catch (error) {
      console.error('Erreur register:', error);
      throw new Error("Erreur lors de l'inscription");
    }
  }

  // Logout
  static async logout(): Promise<void> {
    try {
      const token = await this.getToken();
      if (token) {
        await axios.post(
          API_ENDPOINTS.logout,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }
    } catch (error) {
      console.error('Erreur logout API:', error);
    } finally {
      await AsyncStorage.removeItem(this.TOKEN_KEY);
    }
  }

  // Get stored token
  static async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(this.TOKEN_KEY);
    } catch (error) {
      console.error('Erreur récupération token:', error);
      return null;
    }
  }

  // Check if user is logged in
  static async isLoggedIn(): Promise<boolean> {
    const token = await this.getToken();
    return token !== null;
  }

  // Get current user info
  static async getCurrentUser() {
    try {
      const token = await this.getToken();
      if (!token) return null;

      const response = await axios.get(API_ENDPOINTS.me, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return response.data;
    } catch (error) {
      console.error('Erreur récupération utilisateur:', error);
      return null;
    }
  }
}
