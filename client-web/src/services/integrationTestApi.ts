import api, { fetchCsrfToken } from '@utils/axiosInstance';

// Routes de test pour le développement
export async function testLinkGoogleDrive() {
  await fetchCsrfToken();
  const { data } = await api.post('/integrations/test/google-drive');
  return data;
}

export async function testLinkGithub() {
  await fetchCsrfToken();
  const { data } = await api.post('/integrations/test/github');
  return data;
}
