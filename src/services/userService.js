import apiFetch, { apiFetchMultipart } from './api';

export function getFavorites() { return apiFetch('/user/modelos'); }
export function getFavoriteIds(response) {
  return (Array.isArray(response) ? response : response?.favoriteCarros || response?.FavoriteCarros || [])
    .map((car) => car.linhagemId ?? car.LinhagemId ?? car.id ?? car.Id).filter((id) => id != null).map(String);
}
export function addFavorite(carId) { return apiFetch('/user/modelos', { method: 'POST', body: JSON.stringify({ linhagemId: Number(carId) || carId }) }); }
export function removeFavorite(carId) { return apiFetch(`/user/modelos/${carId}`, { method: 'DELETE' }); }
export function getSavedComparisons() { return apiFetch('/user/comparacoes'); }
export function saveComparison(dto) { return apiFetch('/user/comparacoes', { method: 'POST', body: JSON.stringify(dto) }); }
export function removeSavedComparison(id) { return apiFetch(`/user/comparacoes/${id}`, { method: 'DELETE' }); }
export function monitoredCount() { return apiFetch('/user/modelos/quantidade-salvos'); }
export function comparisonsWeekCount() { return apiFetch('/user/comparacoes/quantidade-semana'); }
export function savedComparisonsCount() { return apiFetch('/user/comparacoes/quantidade-salvas'); }
export function updateProfile(displayName) { return apiFetch('/User/atualizar', { method: 'PUT', body: JSON.stringify({ nomeExibicao: displayName }) }); }
export async function uploadProfilePhoto(asset) {
  const form = new FormData();
  form.append('arquivo', { uri: asset.uri, name: asset.fileName || 'profile.jpg', type: asset.mimeType || 'image/jpeg' });
  return apiFetchMultipart('/User/foto-perfil', form);
}
export function removeProfilePhoto() { return apiFetch('/User/foto-perfil', { method: 'DELETE' }); }
export function beginTwoFactor() { return apiFetch('/User/2fa/iniciar', { method: 'POST' }); }
export function confirmTwoFactor(code) { return apiFetch('/User/2fa/confirmar', { method: 'POST', body: JSON.stringify({ codigo: code }) }); }
export function disableTwoFactor() { return apiFetch('/User/2fa/desativar', { method: 'POST' }); }
export function logoutBackend() { return apiFetch('/User/logout', { method: 'POST' }); }
