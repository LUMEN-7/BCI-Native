import apiFetch from './api';

export function startSearch(payload) {
  return apiFetch('/Pesquisa/busca', { method: 'POST', body: JSON.stringify(payload) });
}
export function getJobStatus(jobId) { return apiFetch(`/Pesquisa/jobs/${jobId}`); }
export function getCars(page = 1, pageSize = 50) { return apiFetch(`/Carro/listar?pagina=${page}&tamanhoPagina=${pageSize}`); }
export function getCar(lineageId) { return apiFetch(`/Carro/recente/${lineageId}`); }
export function getCarVersions(lineageId) { return apiFetch(`/Carro/${lineageId}/versoes`); }
export function getCarVersion(carId) { return apiFetch(`/Carro/versao/${carId}`); }
export function getCarImage(carId) { return apiFetch(`/Carro/Imagem-Carro/${carId}`); }
