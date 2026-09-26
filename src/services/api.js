import { clearSession, getAccessToken } from './storage';

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://apiford.onrender.com';
let unauthorizedHandler = null;

export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
}

async function parseError(response) {
  const data = await response.json().catch(() => ({}));
  return data?.message || data?.title || data?.error || `Erro ${response.status}`;
}

export default async function apiFetch(path, options = {}) {
  const { skip401Redirect = false, ...fetchOptions } = options;
  const token = await getAccessToken();
  const isFormData = typeof FormData !== 'undefined' && fetchOptions.body instanceof FormData;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...fetchOptions,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(fetchOptions.headers || {}),
    },
  });

  if (response.status === 401 && !skip401Redirect) {
    await clearSession();
    unauthorizedHandler?.();
    throw new Error('Sessão expirada. Faça login novamente.');
  }
  if (!response.ok) throw new Error(await parseError(response));
  if (response.status === 204) return null;
  const text = await response.text();
  return text.trim() ? JSON.parse(text) : null;
}

export async function apiFetchMultipart(path, formData, method = 'POST') {
  return apiFetch(path, { method, body: formData });
}
