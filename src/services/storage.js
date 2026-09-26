import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'bci.accessToken';
const USER_KEY = 'bci.currentUser';

export async function setSession(accessToken, user) {
  if (accessToken) await SecureStore.setItemAsync(TOKEN_KEY, accessToken);
  if (user) await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
}

export async function updateStoredUser(changes) {
  const current = (await getCurrentUser()) || {};
  const next = { ...current, ...changes };
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(next));
  return next;
}

export async function getAccessToken() {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function getCurrentUser() {
  try {
    const raw = await AsyncStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function clearSession() {
  await Promise.all([
    SecureStore.deleteItemAsync(TOKEN_KEY),
    AsyncStorage.removeItem(USER_KEY),
  ]);
}

export function userScopedKey(baseKey, user) {
  const id = user?.id ?? user?.Id ?? user?.usuarioId ?? user?.UsuarioId ?? user?.userId ?? user?.UserId ?? user?.email ?? user?.Email;
  return id == null ? null : `${baseKey}:${String(id).trim().toLowerCase()}`;
}

export async function getUserScopedJson(baseKey, user, fallback = null) {
  const key = userScopedKey(baseKey, user);
  if (!key) return fallback;
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export async function setUserScopedJson(baseKey, user, value) {
  const key = userScopedKey(baseKey, user);
  if (!key) return;
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function removeUserScopedItem(baseKey, user) {
  const key = userScopedKey(baseKey, user);
  if (key) await AsyncStorage.removeItem(key);
}
