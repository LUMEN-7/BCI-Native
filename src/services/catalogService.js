import { getCars } from './carsService';
import { pick } from '../utils/vehicleAdapters';
// Stop if an older server ignores pagination; never repeat the same page forever.
export async function getCatalog() {
  const records = new Map();
  for (let page = 1; page <= 100; page++) {
    const response = await getCars(page, 100),
      items = Array.isArray(response) ? response : pick(response, 'items', 'itens', 'carros', 'data');
    if (!Array.isArray(items)) throw new Error('O catálogo retornou um formato inesperado.');
    let added = 0;
    for (const item of items) {
      const id = pick(item, 'linhagemId', 'id');
      if (id != null && !records.has(String(id)) && pick(item, 'excluido') !== true) {
        records.set(String(id), item);
        added++;
      }
    }
    if (items.length < 100 || added === 0) return [...records.values()];
  }
  throw new Error('O catálogo excedeu o limite de carregamento. Refine a consulta na Pesquisa.');
}
