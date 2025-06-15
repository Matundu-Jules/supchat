// services/permissionService.ts
import axios from 'axios';
import { API_ENDPOINTS } from '../constants/api';

const API_URL = API_ENDPOINTS.permissions;

export interface Permission {
  _id: string;
  role: 'admin' | 'member' | string;
  permissions: string[];
  workspaceId: string;
  userId: string;
}

export const fetchPermissions = async (
  token: string
): Promise<Permission[]> => {
  const response = await axios.get<Permission[]>(API_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const getPermissionByWorkspace = async (
  token: string,
  workspaceId: string
): Promise<Permission | null> => {
  const allPermissions = await fetchPermissions(token);
  return (
    allPermissions.find((perm) => perm.workspaceId === workspaceId) || null
  );
};

export const hasPermission = (
  permission: Permission | null,
  required: string
): boolean => {
  if (!permission) return false;
  return (
    permission.role === 'admin' || permission.permissions.includes(required)
  );
};
