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

export async function updateEmail(email: string) {
  await fetchCsrfToken()
  const { data } = await api.put('/user/email', { email })
  return data
}

export async function uploadAvatar(file: File) {
  await fetchCsrfToken()
  const form = new FormData()
  form.append('avatar', file)
  const { data } = await api.post('/user/avatar', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function deleteAvatar() {
  await fetchCsrfToken()
  await api.delete('/user/avatar')
}
