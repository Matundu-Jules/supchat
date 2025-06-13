import api, { fetchCsrfToken } from '@utils/axiosInstance';

/**
 * Récupère la liste des workspaces de l'utilisateur connecté
 */
export async function getUserWorkspaces() {
  try {
    await fetchCsrfToken();
    const { data } = await api.get('/workspaces');
    return data;
  } catch (err: any) {
    throw new Error(
      err?.response?.data?.message ||
        err.message ||
        'Erreur lors du chargement des espaces de travail'
    );
  }
}

/**
 * Crée un nouvel espace de travail
 */
export async function createWorkspace(formData: {
  name: string;
  description?: string;
  isPublic: boolean;
}) {
  try {
    await fetchCsrfToken();
    const { data } = await api.post('/workspaces', formData);
    return data;
  } catch (err: any) {
    throw new Error(
      err?.response?.data?.message ||
        err.message ||
        "Erreur lors de la création de l'espace de travail"
    );
  }
}

/**
 * Invite un membre à un workspace par email
 */
export async function inviteToWorkspace(workspaceId: string, email: string) {
  try {
    await fetchCsrfToken();
    const { data } = await api.post(`/workspaces/${workspaceId}/invite`, {
      email,
    });
    return data;
  } catch (err: any) {
    throw new Error(
      err?.response?.data?.message ||
        err.message ||
        "Erreur lors de l'invitation"
    );
  }
}

/**
 * Rejoint un workspace via un code d'invitation
 */
export async function joinWorkspace(inviteCode: string) {
  try {
    await fetchCsrfToken();
    const { data } = await api.post(`/workspaces/join`, { inviteCode });
    return data;
  } catch (err: any) {
    throw new Error(
      err?.response?.data?.message ||
        err.message ||
        "Erreur lors de la tentative de rejoindre l'espace"
    );
  }
}

/**
 * Met à jour un workspace existant
 */
export async function updateWorkspace(
  workspaceId: string,
  formData: { name: string; description?: string; isPublic: boolean }
) {
  try {
    await fetchCsrfToken();
    const { data } = await api.put(`/workspaces/${workspaceId}`, formData);
    return data;
  } catch (err: any) {
    throw new Error(
      err?.response?.data?.message ||
        err.message ||
        "Erreur lors de la modification de l'espace de travail"
    );
  }
}

/**
 * Supprime un workspace existant
 */
export async function deleteWorkspace(workspaceId: string) {
  try {
    await fetchCsrfToken();
    const { data } = await api.delete(`/workspaces/${workspaceId}`);
    return data;
  } catch (err: any) {
    throw new Error(
      err?.response?.data?.message ||
        err.message ||
        "Erreur lors de la suppression de l'espace de travail"
    );
  }
}

/**
 * Récupère les détails d'un workspace spécifique
 */
export async function getWorkspaceDetails(workspaceId: string) {
  try {
    await fetchCsrfToken();
    const { data } = await api.get(`/workspaces/${workspaceId}`);
    return data;
  } catch (err: any) {
    throw new Error(
      err?.response?.data?.message ||
        err.message ||
        "Erreur lors de la récupération des détails de l'espace de travail"
    );
  }
}
