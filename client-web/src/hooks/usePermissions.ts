import { useEffect, useState } from "react";
import { getWorkspacePermissions, updatePermission } from "@services/permissionApi";

export interface Permission {
  _id: string;
  userId: { _id: string; email?: string; username?: string };
  role: string;
  channelRoles: { channelId: string; role: string }[];
}

export function usePermissions(workspaceId: string) {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = async () => {
    if (!workspaceId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getWorkspacePermissions(workspaceId);
      setPermissions(data);
    } catch (err: any) {
      setError(err.message || "Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  const setRole = async (
    permissionId: string,
    payload: { role?: string; channelRoles?: any[] }
  ) => {
    await updatePermission(permissionId, payload);
    fetchAll();
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId]);

  return { permissions, loading, error, fetchPermissions: fetchAll, setRole };
}

