import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getUserWorkspaces, createWorkspace } from '@services/workspaceApi';

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

const workspacesSlice = createSlice({
  name: 'workspaces',
  initialState: {
    items: [],
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
        state.items = action.payload;
        state.loading = false;
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
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(addWorkspace.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Erreur lors de la création';
      });
  },
});

export default workspacesSlice.reducer;
