import { adaptCarCard, adaptCarDetail, pick, unwrapField } from './vehicleAdapters';
export const SIMILARITY_FILTERS = [['engine', 'Motor semelhante'], ['price', 'Faixa de preço'], ['performance', 'Desempenho'], ['category', 'Mesma categoria'], ['transmission', 'Transmissão'], ['dimensions', 'Dimensões'], ['safety', 'Segurança'], ['technology', 'Tecnologia']].map(([id, label]) => ({
  id,
  label
}));
export function numeric(value) {
  if (value == null) return null;
  const match = String(value).replace(/\.(?=\d{3}(?:\D|$))/g, '').match(/\d+(?:[.,]\d+)?/);
  return match ? Number(match[0].replace(',', '.')) : null;
}
const known = value => value != null && String(value).trim() !== '' && !/^(não informado|n\/d|--)/i.test(String(value));
const near = (a, b, t) => a != null && b != null && Math.abs(a - b) / Math.max(Math.abs(a), Math.abs(b), 1) <= t;
const overlap = (a, b) => known(a) && known(b) && (String(a).toLowerCase().includes(String(b).toLowerCase()) || String(b).toLowerCase().includes(String(a).toLowerCase()));
export function selectionCar(dto) {
  const d = adaptCarDetail(dto);
  const card = adaptCarCard(dto);
  const price = pick(dto, 'preco');
  const firstPrice = Array.isArray(price) ? price[0] : price;
  return {
    ...card,
    comparisonId: pick(dto, 'id', 'linhagemId'),
    powerValue: numeric(card.power),
    price: numeric(unwrapField(pick(firstPrice, 'valor') ?? pick(dto, 'precoMedio')).value),
    transmission: d?.specs.transmission.value,
    dimensions: {
      wheelbase: numeric(d?.specs.wheelbase.value),
      length: numeric(d?.specs.length.value)
    },
    safetyFeatures: d?.sections.security.map(v => v.value) || [],
    technologyFeatures: d?.sections.technology.map(v => v.value) || []
  };
}
export function matchesSimilarity(a, b, id) {
  if (!a || !b) return false;
  if (id === 'engine') return overlap(a.engine, b.engine) || near(numeric(a.engine), numeric(b.engine), .25);
  if (id === 'price') return near(a.price, b.price, .2);
  if (id === 'performance') return near(a.powerValue, b.powerValue, .2);
  if (id === 'category') return overlap(a.type, b.type);
  if (id === 'transmission') return overlap(a.transmission, b.transmission);
  if (id === 'dimensions') return near(a.dimensions?.wheelbase ?? a.dimensions?.length, b.dimensions?.wheelbase ?? b.dimensions?.length, .1);
  const key = id === 'safety' ? 'safetyFeatures' : 'technologyFeatures';
  const x = a[key] || [],
    y = b[key] || [];
  return !!x.length && !!y.length && x.filter(v => y.some(w => String(v).toLowerCase() === String(w).toLowerCase())).length / Math.max(x.length, y.length) >= .5;
}
export function comparisonIds(cars) {
  const ids = cars.map(c => Number(typeof c === 'object' ? c.comparisonId ?? c.id : c));
  if (ids.length < 2 || ids.length > 6 || ids.some(id => !Number.isSafeInteger(id) || id <= 0) || new Set(ids).size !== ids.length) throw new Error('Selecione de 2 a 6 modelos diferentes.');
  return ids;
}
export function savedComparisonCars(item) {
  let payload = pick(item, 'requestPayload');
  try {
    if (typeof payload === 'string') payload = JSON.parse(payload);
  } catch {
    throw new Error('Esta comparação salva tem dados inválidos.');
  }
  return comparisonIds(pick(payload, 'carrosIds') || []).map(id => ({
    id: String(id),
    comparisonId: id
  }));
}
export function comparisonRows(cars, differencesOnly = false) {
  const keys = [...new Set(cars.flatMap(c => Object.keys(c.specs || {})))];
  return keys.map(key => ({
    key,
    values: cars.map(c => c.specs?.[key] || 'Não informado')
  })).filter(row => !differencesOnly || new Set(row.values).size > 1);
}
