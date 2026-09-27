import apiFetch, { apiFetchMultipart } from './api';
import { File, Paths } from 'expo-file-system';
import { Platform } from 'react-native';

export function startSearch(payload) {
  return apiFetch('/Pesquisa/busca', { method: 'POST', body: JSON.stringify(payload) });
}
export function getJobStatus(jobId) { return apiFetch(`/Pesquisa/jobs/${encodeURIComponent(jobId)}`); }
export function getCars(page = 1, pageSize = 50) { return apiFetch(`/Carro/listar?pagina=${page}&tamanhoPagina=${pageSize}`); }
export function getCar(lineageId) { return apiFetch(`/Carro/recente/${encodeURIComponent(lineageId)}`); }
export function getCarVersions(lineageId) { return apiFetch(`/Carro/${lineageId}/versoes`); }
export function getCarVersion(carId) { return apiFetch(`/Carro/versao/${carId}`); }
export function getCarImage(carId) { return apiFetch(`/Carro/Imagem-Carro/${carId}`); }

// The API consumes a canonical JSON file after the user reviews CSV/JSON/manual data.
// RN multipart requires a file URI; browser Blob parts are only used on web.
export async function importVehicle(payload) {
  const form = new FormData();
  const json = JSON.stringify(payload);
  let file;
  try {
    if (Platform.OS === 'web') {
      form.append('arquivo', new Blob([json], { type: 'application/json' }), 'importacao-mobile.json');
    } else {
      file = new File(Paths.cache, `bci-import-${Date.now()}-${Math.random().toString(36).slice(2)}.json`);
      file.create();
      file.write(json);
      form.append('arquivo', { uri: file.uri, name: 'importacao-mobile.json', type: 'application/json' });
    }
    return await apiFetchMultipart('/Carro/importar-arquivo', form);
  } finally {
    if (file?.exists) { try { file.delete(); } catch { /* OS can evict cached files. */ } }
  }
}
