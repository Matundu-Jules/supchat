// hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { AuthService } from '../services/authService';

export function useAuth() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const savedToken = await AuthService.getToken();
      setToken(savedToken);
    } catch (error) {
      console.error('Erreur vérification auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const result = await AuthService.login({ email, password });
      setToken(result.token);
      return result;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AuthService.logout();
      setToken(null);
    } catch (error) {
      console.error('Erreur logout:', error);
    }
  };

  const isAuthenticated = token !== null;

  return {
    token,
    loading,
    isAuthenticated,
    login,
    logout,
    checkAuthStatus,
  };
}
