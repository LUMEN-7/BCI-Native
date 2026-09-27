import { adaptCarCard, pick } from '../../utils/vehicleAdapters';

export const METRIC_LABELS = ['MODELOS\nMONITORADOS', 'COMPARAÇÕES\nSALVAS', 'ANÁLISES\nESTA SEMANA', 'ALERTAS\nATIVOS'];
export function formatMetric(value) {
  const raw = typeof value === 'object' ? pick(value, 'quantidade', 'count', 'total') : value;
  if (typeof raw !== 'number' && typeof raw !== 'string') return '--';
  if (String(raw).trim() === '') return '--';
  const count = Number(raw);
  return Number.isInteger(count) && count >= 0 ? String(count).padStart(2, '0') : '--';
}
export function savedModels(response) {
  const rows = Array.isArray(response) ? response : pick(response, 'favoriteCarros') || [];
  if (!Array.isArray(rows)) return [];
  const unique = new Map();
  for (const dto of rows) {
    if (pick(dto, 'linhagemId', 'id') == null || pick(dto, 'excluido') === true) continue;
    const car = adaptCarCard(dto);
    unique.set(car.id, car);
  }
  return [...unique.values()];
}
export function savedCoverage(cars) {
  const categories = new Map();
  for (const car of cars) {
    const label = car.type?.trim() || 'Não informado';
    const key = label.toLocaleLowerCase('pt-BR');
    const group = categories.get(key) || { name: label, count: 0 };
    group.count++; categories.set(key, group);
  }
  return [...categories.values()].sort((a, b) => b.count - a.count).map(item => ({ ...item, percentage: cars.length ? Math.round(item.count / cars.length * 100) : 0 }));
}
export function unreadNotifications(response) {
  if (!Array.isArray(response)) return [];
  return response.filter(item => pick(item, 'excluido') !== true && pick(item, 'lido', 'lida', 'read') === false)
    .sort((a, b) => timestamp(pick(b, 'dataCriacao')) - timestamp(pick(a, 'dataCriacao')));
}
function timestamp(value) {
  const time = Date.parse(value);
  return Number.isFinite(time) ? time : 0;
}
export function recentComparisons(response) {
  if (!Array.isArray(response)) return [];
  return response.filter(item => pick(item, 'id') != null).sort((a, b) => timestamp(pick(b, 'dataSalvamento')) - timestamp(pick(a, 'dataSalvamento'))).slice(0, 3);
}
export function activityDate(value) {
  if (!timestamp(value)) return '';
  return new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
export function greeting(hour) {
  return hour < 12 ? 'BOM DIA,' : hour < 18 ? 'BOA TARDE,' : 'BOA NOITE,';
}
export function firstName(user) {
  return String(pick(user, 'nomeExibicao', 'userName', 'name') || 'Usuário').trim().split(/\s+/)[0] || 'Usuário';
}
