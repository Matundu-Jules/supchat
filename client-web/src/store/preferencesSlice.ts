import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type Theme = 'light' | 'dark'
export type Status = 'online' | 'away' | 'busy' | 'offline'

interface PreferencesState {
  theme: Theme
  status: Status
}

const initialState: PreferencesState = {
  theme: (localStorage.getItem('theme') as Theme) || 'light',
  status: (localStorage.getItem('status') as Status) || 'online',
}

const preferencesSlice = createSlice({
  name: 'preferences',
  initialState,
  reducers: {
    setTheme(state, action: PayloadAction<Theme>) {
      state.theme = action.payload
      localStorage.setItem('theme', action.payload)
    },
    setStatus(state, action: PayloadAction<Status>) {
      state.status = action.payload
      localStorage.setItem('status', action.payload)
    },
    setPreferences(state, action: PayloadAction<Partial<PreferencesState>>) {
      if (action.payload.theme) {
        state.theme = action.payload.theme
        localStorage.setItem('theme', action.payload.theme)
      }
      if (action.payload.status) {
        state.status = action.payload.status
        localStorage.setItem('status', action.payload.status)
      }
    },
  },
})

export const { setTheme, setStatus, setPreferences } = preferencesSlice.actions
export default preferencesSlice.reducer
