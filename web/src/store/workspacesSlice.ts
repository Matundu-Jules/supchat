import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getUserWorkspaces,
  createWorkspace,
  requestToJoinWorkspace,
  getJoinRequests,
  approveJoinRequest,
  rejectJoinRequest,
  removeMemberFromWorkspace,
} from '@services/workspaceApi';

export const fetchWorkspaces = createAsyncThunk(
  'workspaces/fetchAll',
  async () => {
    return await getUserWorkspaces();
  }
);

export const addWorkspace = createAsyncThunk(
  'workspaces/add',
  async (formData: {
    name: string;
    description?: string;
    isPublic: boolean;
  }) => {
    await createWorkspace(formData);
    return await getUserWorkspaces();
  }
);

export const requestJoinWorkspace = createAsyncThunk(
  'workspaces/requestJoin',
  async ({
    workspaceId,
    message,
  }: {
    workspaceId: string;
    message?: string;
  }) => {
    await requestToJoinWorkspace(workspaceId, message);
    return await getUserWorkspaces();
  }
);

export const fetchJoinRequests = createAsyncThunk(
  'workspaces/fetchJoinRequests',
  async (workspaceId: string) => {
    return await getJoinRequests(workspaceId);
  }
);

export const approveJoinRequestAction = createAsyncThunk(
  'workspaces/approveJoinRequest',
  async ({
    workspaceId,
    requestUserId,
  }: {
    workspaceId: string;
    requestUserId: string;
  }) => {
    await approveJoinRequest(workspaceId, requestUserId);
    return { workspaceId, requestUserId };
  }
);

export const rejectJoinRequestAction = createAsyncThunk(
  'workspaces/rejectJoinRequest',
  async ({
    workspaceId,
    requestUserId,
  }: {
    workspaceId: string;
    requestUserId: string;
  }) => {
    await rejectJoinRequest(workspaceId, requestUserId);
    return { workspaceId, requestUserId };
  }
);

export const removeMemberAction = createAsyncThunk(
  'workspaces/removeMember',
  async ({ workspaceId, userId }: { workspaceId: string; userId: string }) => {
    const result = await removeMemberFromWorkspace(workspaceId, userId);
    return result;
  }
);

const workspacesSlice = createSlice({
  name: 'workspaces',
  initialState: {
    items: [] as any[],
    joinRequests: [] as any[],
    loading: false,
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWorkspaces.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWorkspaces.fulfilled, (state, action) => {
        console.log(
          '🔍 DEBUG: fetchWorkspaces.fulfilled called with:',
          action.payload
        );
        state.items = Array.isArray(action.payload) ? action.payload : [];
        state.loading = false;
        console.log('🔍 DEBUG: Updated state.items:', state.items);
      })
      .addCase(fetchWorkspaces.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Erreur lors du chargement';
      })
      .addCase(addWorkspace.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addWorkspace.fulfilled, (state, action) => {
        state.items = Array.isArray(action.payload) ? action.payload : [];
        state.loading = false;
      })
      .addCase(addWorkspace.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Erreur lors de la création';
      })
      .addCase(requestJoinWorkspace.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(requestJoinWorkspace.fulfilled, (state, action) => {
        state.items = Array.isArray(action.payload) ? action.payload : [];
        state.loading = false;
      })
      .addCase(requestJoinWorkspace.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message || "Erreur lors de l'envoi de la demande";
      })
      .addCase(fetchJoinRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJoinRequests.fulfilled, (state, action) => {
        state.joinRequests = action.payload;
        state.loading = false;
      })
      .addCase(fetchJoinRequests.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message || 'Erreur lors du chargement des demandes';
      })
      .addCase(approveJoinRequestAction.fulfilled, (state) => {
        state.loading = false;
        // Rafraîchir les demandes après approbation
      })
      .addCase(rejectJoinRequestAction.fulfilled, (state) => {
        state.loading = false;
        // Rafraîchir les demandes après rejet
      })
      .addCase(removeMemberAction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeMemberAction.fulfilled, (state, action) => {
        state.loading = false;
        // Le résultat contient le workspace mis à jour
        const updatedWorkspace = action.payload.workspace;
        if (updatedWorkspace) {
          state.items = state.items.map((workspace: any) => {
            if (workspace._id === updatedWorkspace._id) {
              return updatedWorkspace;
            }
            return workspace;
          });
        }
      })
      .addCase(removeMemberAction.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message || 'Erreur lors de la suppression du membre';
      });
  },
});

export default workspacesSlice.reducer;
