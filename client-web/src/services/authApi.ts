// src/services/authApi.ts

import api, { fetchCsrfToken } from '@utils/axiosInstance';

/* ---------- TYPES ---------- */
export type RegisterData = {
  name: string;
  email: string;
  password: string;
};

export type LoginData = {
  email: string;
  password: string;
};

/* ---------- API CALLS (SECURE) ---------- */
export async function register(data: RegisterData) {
  try {
    await fetchCsrfToken();
    const { data: res } = await api.post('/auth/register', data);
    return res;
  } catch (err: any) {
    const msg = err?.response?.data?.message || err.message || 'Unknown error';
    throw new Error(msg);
  }
}

export async function loginApi(data: LoginData) {
  try {
    await fetchCsrfToken();
    const { data: res } = await api.post('/auth/login', data);
    return res;
  } catch (err: any) {
    const msg = err?.response?.data?.message || err.message || 'Unknown error';
    throw new Error(msg);
  }
}

export async function googleLogin(tokenId: string) {
  try {
    await fetchCsrfToken();
    const { data: res } = await api.post('/auth/google-login', { tokenId });
    return res;
  } catch (err: any) {
    const msg = err?.response?.data?.message || err.message || 'Unknown error';
    throw new Error(msg);
  }
}

export async function facebookLogin(accessToken: string) {
  try {
    await fetchCsrfToken();
    const { data: res } = await api.post('/auth/facebook-login', {
      accessToken,
    });
    return res;
  } catch (err: any) {
    const msg = err?.response?.data?.message || err.message || 'Unknown error';
    throw new Error(msg);
  }
}

export async function logoutApi() {
  try {
    await fetchCsrfToken();
    await api.post('/auth/logout');
  } catch (err: any) {
    const msg = err?.response?.data?.message || err.message || 'Unknown error';
    throw new Error(msg);
  }
}

export async function logoutAll() {
  await fetchCsrfToken();
  await api.post('/auth/logout-all');
}

export const forgotPassword = (email: string) =>
  api.post('/auth/forgot-password', { email });

export const resetPassword = (token: string, newPassword: string) =>
  api.post('/auth/reset-password', { token, newPassword });

export async function changePassword(data: {
  currentPassword?: string;
  newPassword: string;
}) {
  try {
    await fetchCsrfToken();
    const { data: res } = await api.post('/auth/change-password', data);
    return res;
  } catch (err: any) {
    const msg = err?.response?.data?.message || err.message || 'Unknown error';
    throw new Error(msg);
  }
}

export async function setPassword(newPassword: string) {
  try {
    await fetchCsrfToken();
    const { data: res } = await api.post('/auth/set-password', { newPassword });
    return res;
  } catch (err: any) {
    const msg = err?.response?.data?.message || err.message || 'Unknown error';
    throw new Error(msg);
  }
}

export async function getCurrentUser() {
  const { data } = await api.get('/auth/me');
  return data;
}

export async function deleteAccount() {
  await fetchCsrfToken();
  await api.delete('/auth/me');
}
