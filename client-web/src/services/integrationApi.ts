import api, { fetchCsrfToken } from "@utils/axiosInstance"

export async function listIntegrations() {
  const { data } = await api.get("/integrations")
  return data as { googleDrive: boolean; github: boolean }
}

export async function linkGoogleDrive(code: string) {
  await fetchCsrfToken()
  const { data } = await api.post("/integrations/google-drive", { code })
  return data
}

export async function unlinkGoogleDrive() {
  await fetchCsrfToken()
  await api.delete("/integrations/google-drive")
}

export async function linkGithub(token: string) {
  await fetchCsrfToken()
  const { data } = await api.post("/integrations/github", { token })
  return data
}

export async function unlinkGithub() {
  await fetchCsrfToken()
  await api.delete("/integrations/github")
}
