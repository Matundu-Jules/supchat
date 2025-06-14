import api, { fetchCsrfToken } from '@utils/axiosInstance'

export async function getProfile() {
  const { data } = await api.get('/user/profile')
  return data
}

export async function updateProfile(data: { name?: string; avatar?: string }) {
  await fetchCsrfToken()
  const res = await api.put('/user/profile', data)
  return res.data
}

export async function getPreferences() {
  const { data } = await api.get('/user/preferences')
  return data
}

export async function updatePreferences(data: { theme?: string; status?: string }) {
  await fetchCsrfToken()
  const res = await api.put('/user/preferences', data)
  return res.data
}

export async function exportUserData() {
  const { data } = await api.get('/user/export')
  return data
}
