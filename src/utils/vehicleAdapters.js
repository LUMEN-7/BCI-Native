// Backend DTOs mix PascalCase envelopes and camelCase containers.
export function pick(object, ...names) {
  if (!object || typeof object !== 'object') return undefined;
  for (const name of names) {
    const key = Object.keys(object).find(k => k.toLowerCase() === name.toLowerCase());
    if (key !== undefined && object[key] != null) return object[key];
  }
}
export const isMissing = field => field == null || field.value == null || String(field.value).trim() === '' || /^(não informado|n\/a)$/i.test(String(field.value));
const list = value => value == null ? [] : Array.isArray(value) ? value : [value];
const first = value => Array.isArray(value) ? value[0] || {} : value || {};
const importedEvidence = value => ({ ...unwrapField(value), confidence: 0, source: null, conflict: false, alternatives: [], origin: 'imported' });
export function normalizeConfidence(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.round(Math.max(0, Math.min(100, number <= 1 ? number * 100 : number))) : 0;
}
function display(value, suffix) {
  if (value == null || value === '') return 'Não informado';
  if (Array.isArray(value)) return value.map(v => display(v, '')).join(', ');
  if (typeof value === 'object') return display(pick(value, 'valor', 'value'), suffix);
  const text = String(value).trim();
  // Preserve units provided by the backend; don't turn "150 cv" into "150 cv cv".
  return `${text}${suffix && /^-?\d+(?:[.,]\d+)?$/.test(text) ? suffix : ''}`;
}
export function unwrapField(field, suffix = '') {
  const sources = list(pick(field, 'fontes'));
  const source = sources[0];
  const raw = pick(source, 'valor', 'value') ?? pick(field, 'valor', 'value') ?? (typeof field !== 'object' ? field : null);
  const confidence = normalizeConfidence(pick(field, 'confianca', 'confidence') ?? pick(source, 'confianca', 'confidence'));
  return {
    value: display(raw, suffix), confidence,
    source: pick(source, 'fonte', 'source', 'url', 'link') ?? pick(field, 'fonte', 'source', 'url', 'link') ?? null,
    conflict: pick(field, 'conflito', 'conflict') === true,
    alternatives: sources.map(item => ({ value: display(pick(item, 'valor', 'value'), suffix), source: pick(item, 'fonte', 'source', 'url', 'link') ?? null, confidence: normalizeConfidence(pick(item, 'confianca', 'confidence') ?? pick(field, 'confianca', 'confidence')) })),
    origin: 'api',
  };
}
export function adaptCarCard(dto) {
  const specs = first(pick(dto, 'especificacoes'));
  const model = display(pick(dto, 'modelo'), '');
  const year = pick(dto, 'ano') ?? '';
  return {
    id: String(pick(dto, 'linhagemId', 'id') ?? ''),
    brand: pick(dto, 'marca') ?? '', brandOrigin: 'api', model, modelOrigin: 'api', year, yearOrigin: 'api', name: `${model} ${year}`.trim(),
    image: pick(dto, 'imagemUrl') || null, imageOrigin: 'api',
    engine: unwrapField(pick(specs, 'motor')).value,
    power: unwrapField(pick(specs, 'potencia'), ' cv').value,
    type: unwrapField(pick(dto, 'categoria')).value,
    isImported: pick(dto, 'isImported', 'importado') === true, raw: dto,
  };
}
export function extractFeatures(value) {
  if (value == null) return [];
  if (Array.isArray(value)) return value.flatMap(extractFeatures);
  const sources = list(pick(value, 'fontes'));
  if (sources.length) return sources.flatMap(source => {
    const values = list(pick(source, 'valor', 'value'));
    return values.flatMap(item => extractFeatures({ valor: item, fonte: pick(source, 'fonte', 'source'), confianca: pick(value, 'confianca', 'confidence') ?? pick(source, 'confianca', 'confidence'), conflito: pick(value, 'conflito', 'conflict') }));
  });
  const raw = pick(value, 'valor', 'value');
  if (Array.isArray(raw)) return raw.flatMap(item => extractFeatures({ ...value, valor: item, value: item }));
  const field = unwrapField(value);
  if (isMissing(field)) return [];
  return field.value.split(/[;\n]/).map(item => item.trim()).filter(Boolean).map(item => ({ ...field, value: item }));
}

export function importedEditRecord(car, record) {
  const form = { ...record.importForm, brand: car.brand, modelo: car.model, ano: String(car.year), image: car.image, description: car.description };
  for (const key of Object.keys(SPEC_MAP)) form[key] = isMissing(car.specs[key]) ? '' : car.specs[key].value;
  form.segment = isMissing(car.specs.type) ? '' : car.specs.type.value;
  form.consumption = isMissing(car.specs.consumption) ? '' : car.specs.consumption.value;
  for (const [key, items] of Object.entries(car.sections)) form[key] = items.map(item => item.value).join('\n');
  return { ...record, raw: car.raw, importForm: form };
}
const SPEC_MAP = {
  engine: ['especificacoes', 'motor', ''], power: ['especificacoes', 'potencia', ' cv'],
  torque: ['especificacoes', 'torque', ' kgfm'], powerRpm: ['especificacoes', 'potenciaRpm', ' rpm'], torqueRpm: ['especificacoes', 'torqueRpm', ' rpm'],
  transmission: ['especificacoes', 'transmissao', ''], drivetrain: ['especificacoes', 'tracao', ''],
  cityConsumption: ['consumos', 'cidade', ' km/l'], highwayConsumption: ['consumos', 'estrada', ' km/l'],
  length: ['dimensoes', 'comprimento', ''], width: ['dimensoes', 'largura', ''], height: ['dimensoes', 'altura', ''], wheelbase: ['dimensoes', 'entreEixos', ''],
  tireType: ['pneus', 'tipo', ''], rim: ['pneus', 'aro', '″'], tireWidth: ['pneus', 'largura', ' mm'], tireProfile: ['pneus', 'perfil', '%'],
  tankCapacity: ['extras', 'capacidadeTanque', ' L'], fuelType: ['extras', 'tipoCombustivel', ''], loadCapacity: ['extras', 'capacidadeCarga', ' kg'], towingCapacity: ['extras', 'capacidadeReboque', ' kg'],
};
export function adaptCarDetail(dto, imported = null) {
  if (!dto || pick(dto, 'excluido') === true || pick(dto, 'id', 'linhagemId') == null) return null;
  const specs = Object.fromEntries(Object.entries(SPEC_MAP).map(([key, [group, name, suffix]]) => [key, unwrapField(pick(first(pick(dto, group)), name), suffix)]));
  specs.model = unwrapField(pick(dto, 'modelo')); specs.brand = unwrapField(pick(dto, 'marca')); specs.year = unwrapField(pick(dto, 'ano'));
  specs.type = unwrapField(pick(dto, 'categoria')); specs.driveModes = unwrapField(pick(dto, 'modos'));
  specs.consumption = specs.cityConsumption;
  const extras = first(pick(dto, 'extras'));
  const sections = {
    performance: extractFeatures(pick(extras, 'performance', 'desempenho')),
    security: extractFeatures(pick(extras, 'security', 'seguranca', 'segurança')),
    technology: extractFeatures(pick(extras, 'technology', 'tecnologia', 'tecnologias')),
    comfort: extractFeatures(pick(extras, 'comfort', 'conforto')),
  };
  let descriptionEvidence = unwrapField(pick(dto, 'descricao'));
  let description = descriptionEvidence.value;
  let descriptionOrigin = 'api';
  // Local import values complement only fields the API did not return.
  const local = imported?.importForm || {};
  const localFieldNames = { type: 'segment', cityConsumption: 'consumption' };
  for (const key of Object.keys(SPEC_MAP)) {
    const localValue = local[localFieldNames[key] || key];
    const localField = localValue && typeof localValue === 'object' ? localValue : { value: localValue };
    if (isMissing(specs[key]) && !isMissing(localField)) specs[key] = importedEvidence(localValue);
  }
  specs.consumption = specs.cityConsumption;
  for (const key of Object.keys(sections)) {
    if (!sections[key].length) sections[key] = extractFeatures(local[key]).map(item => importedEvidence(item.value));
  }
  if (description === 'Não informado' && local.description) { description = local.description; descriptionOrigin = 'imported'; descriptionEvidence = importedEvidence(local.description); }
  const valid = Object.entries(specs).filter(([key, value]) => !['model', 'brand', 'year', 'consumption'].includes(key) && !isMissing(value)).map(([, value]) => value);
  const card = adaptCarCard(dto);
  if (imported?.importForm?.image && !card.image) { card.image = imported.importForm.image; card.imageOrigin = 'imported'; }
  return {
    ...card, isImported: Boolean(imported), specs, sections,
    sources: list(pick(dto, 'fontes', 'sources')), description, descriptionOrigin, descriptionEvidence,
    averageConfidence: valid.length ? Math.round(valid.reduce((sum, field) => sum + field.confidence, 0) / valid.length) : 0,
    isFuture: Number(pick(dto, 'ano')) > new Date().getFullYear(), raw: dto,
  };
}
export function applyEnrichment(car, enrichment, requestedFields) {
  const specs = { ...car.specs };
  for (const key of requestedFields) {
    const field = unwrapField(enrichment?.specs?.[key]);
    if (isMissing(specs[key]) && !isMissing(field)) specs[key] = { value: field.value, source: null, confidence: 0, conflict: false, origin: 'ai', alternatives: [] };
  }
  const sections = { ...car.sections };
  for (const key of Object.keys(sections)) {
    if (!sections[key].length) sections[key] = extractFeatures(enrichment?.sections?.[key]).map(item => ({ value: item.value, source: null, confidence: 0, conflict: false, origin: 'ai', alternatives: [] }));
  }
  return { ...car, specs, sections };
}
export function safeSourceUrl(value) {
  if (typeof value !== 'string') return null;
  try {
    const url = new URL(value.trim());
    return ['http:', 'https:'].includes(url.protocol) && url.hostname && !url.username && !url.password ? url.href : null;
  } catch { return null; }
}
export function resolveSource(source, sources = []) {
  if (source == null || source === '') return null;
  const record = typeof source === 'object' ? source : sources.find(item => ['id', 'nome', 'name', 'url', 'link'].some(key => String(pick(item, key) ?? '') === String(source)));
  const rawUrl = pick(record, 'url', 'link', 'site') ?? (typeof source === 'string' ? source : null);
  const url = safeSourceUrl(rawUrl);
  return { name: String(pick(record, 'nome', 'name') ?? rawUrl ?? pick(record, 'id') ?? 'Fonte sem nome'), url };
}
export function adaptComparisonCar(dto) {
  if (!dto) return null;
  const detail = adaptCarDetail(dto);
  const fields = detail?.specs || {};
  return { ...adaptCarCard(dto), id: String(pick(dto, 'id', 'linhagemId') ?? ''), specs: Object.fromEntries([
    ['Motor', 'engine'], ['Potência', 'power'], ['Torque', 'torque'], ['Transmissão', 'transmission'], ['Tração', 'drivetrain'], ['Consumo cidade', 'cityConsumption'], ['Consumo estrada', 'highwayConsumption'], ['Comprimento', 'length'], ['Largura', 'width'], ['Altura', 'height'],
  ].map(([label, key]) => [label, fields[key]?.value || 'Não informado'])), raw: dto };
}
