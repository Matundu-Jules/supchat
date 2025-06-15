import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getPermissionByWorkspace,
  hasPermission,
  Permission,
} from '../services/permissionService';

export const usePermission = (workspaceId: string) => {
  const [permission, setPermission] = useState<Permission | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const loadPermission = async () => {
      try {
        const token = await AsyncStorage.getItem(
          process.env.EXPO_PUBLIC_TOKEN_STORAGE_KEY || 'authToken'
        );
        if (token) {
          const userPerm = await getPermissionByWorkspace(token, workspaceId);
          setPermission(userPerm);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des permissions', error);
      } finally {
        setLoading(false);
      }
    };

    if (workspaceId) {
      loadPermission();
    }
  }, [workspaceId]);

  const check = (required: string): boolean => {
    return hasPermission(permission, required);
  };

  const isAdmin = permission?.role === 'admin';

  return {
    permission,
    loading,
    check,
    isAdmin,
  };
};
