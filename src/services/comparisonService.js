import apiFetch from './api';
export function compareDirect(carIds) {
  return apiFetch('/Comparacao/direta', { method: 'POST', body: JSON.stringify({ carrosIds: carIds }) });
}
