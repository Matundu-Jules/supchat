import api, { fetchCsrfToken } from '@utils/axiosInstance';

/**
 * Récupère la liste des workspaces de l'utilisateur connecté
 */
export async function getUserWorkspaces() {
  try {
    await fetchCsrfToken();
    const { data } = await api.get('/workspaces');
    // Le backend retourne { workspaces: [...] }
    return data.workspaces || [];
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
    // Le backend retourne { message: '...', workspace: {...} }
    return data.workspace || data;
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

/**
 * Récupère la liste des membres d'un workspace
 */
export async function getWorkspaceMembers(workspaceId: string) {
  try {
    await fetchCsrfToken();
    const { data } = await api.get(`/workspaces/${workspaceId}/members`);
    return data;
  } catch (err: any) {
    throw new Error(
      err?.response?.data?.message ||
        err.message ||
        'Erreur lors de la récupération des membres du workspace'
    );
  }
}

/**
 * Récupère les infos publiques d'un workspace (pas besoin d'être connecté)
 * Si workspace privé, il faut fournir l'email invité en query.
 */
export async function getWorkspacePublicInfo(
  workspaceId: string,
  email?: string
) {
  try {
    let url = `/workspaces/${workspaceId}/public`;
    if (email) url += `?email=${encodeURIComponent(email)}`;
    const { data } = await api.get(url);
    return data;
  } catch (err: any) {
    throw new Error(
      err?.response?.data?.message ||
        err.message ||
        'Erreur lors de la récupération des infos publiques du workspace'
    );
  }
}

/**
 * Demander à rejoindre un workspace public
 */
export async function requestToJoinWorkspace(
  workspaceId: string,
  message?: string
) {
  try {
    await fetchCsrfToken();
    const { data } = await api.post(`/workspaces/${workspaceId}/request-join`, {
      message: message || '',
    });
    return data;
  } catch (err: any) {
    throw new Error(
      err?.response?.data?.message ||
        err.message ||
        'Erreur lors de la demande de rejoindre le workspace'
    );
  }
}

/**
 * Récupérer les demandes de rejoindre pour un workspace (propriétaire/admin seulement)
 */
export async function getJoinRequests(workspaceId: string) {
  try {
    await fetchCsrfToken();
    const { data } = await api.get(`/workspaces/${workspaceId}/join-requests`);
    return data;
  } catch (err: any) {
    throw new Error(
      err?.response?.data?.message ||
        err.message ||
        'Erreur lors de la récupération des demandes de rejoindre'
    );
  }
}

/**
 * Approuver une demande de rejoindre
 */
export async function approveJoinRequest(
  workspaceId: string,
  requestUserId: string
) {
  try {
    await fetchCsrfToken();
    const { data } = await api.post(
      `/workspaces/${workspaceId}/join-requests/${requestUserId}/approve`
    );
    return data;
  } catch (err: any) {
    throw new Error(
      err?.response?.data?.message ||
        err.message ||
        "Erreur lors de l'approbation de la demande"
    );
  }
}

/**
 * Rejeter une demande de rejoindre
 */
export async function rejectJoinRequest(
  workspaceId: string,
  requestUserId: string
) {
  try {
    await fetchCsrfToken();
    const { data } = await api.post(
      `/workspaces/${workspaceId}/join-requests/${requestUserId}/reject`
    );
    return data;
  } catch (err: any) {
    throw new Error(
      err?.response?.data?.message ||
        err.message ||
        'Erreur lors du rejet de la demande'
    );
  }
}

/**
 * Supprimer un membre d'un workspace
 */
export async function removeMemberFromWorkspace(
  workspaceId: string,
  userId: string
) {
  try {
    await fetchCsrfToken();
    const { data } = await api.delete(
      `/workspaces/${workspaceId}/members/${userId}`
    );
    return data;
  } catch (err: any) {
    throw new Error(
      err?.response?.data?.message ||
        err.message ||
        'Erreur lors de la suppression du membre'
    );
  }
}

/**
 * Invite un invité avec accès limité à des channels spécifiques
 */
export async function inviteGuestToWorkspace(
  workspaceId: string,
  email: string,
  allowedChannels: string[]
) {
  try {
    await fetchCsrfToken();
    const { data } = await api.post(`/workspaces/${workspaceId}/invite-guest`, {
      email,
      allowedChannels,
    });
    return data;
  } catch (err: any) {
    throw new Error(
      err?.response?.data?.message ||
        err.message ||
        "Erreur lors de l'invitation de l'invité"
    );
  }
}
