export const EMPTY_VEHICLE = {
  brand: '', modelo: '', ano: '', segment: '', engine: '', power: '',
  transmission: '', price: '', consumption: '', cityConsumption: '', highwayConsumption: '',
  torque: '', drivetrain: '',
  length: '', width: '', height: '', wheelbase: '',
  tireType: '', rim: '', tireWidth: '', tireProfile: '',
  tankCapacity: '', fuelType: '', loadCapacity: '', towingCapacity: '',
  performance: '', security: '', technology: '', comfort: '',
  description: '', image: null,
};

export const FIELD_GROUPS = [
  {
    title: 'Identidade do modelo',
    fields: [
      ['brand', 'Marca', 'Ex: Ford'],
      ['modelo', 'Modelo', 'Ex: Territory'],
      ['ano', 'Ano', 'Ex: 2025'],
      ['segment', 'Categoria', 'Ex: SUV'],
      ['description', 'Descrição', 'Resumo do modelo'],
    ],
  },
  {
    title: 'Motorização e desempenho',
    fields: [
      ['engine', 'Motor', 'Ex: 1.5 EcoBoost'],
      ['power', 'Potência', 'Ex: 169'],
      ['torque', 'Torque', 'Ex: 25'],
      ['transmission', 'Transmissão', 'Ex: Automática'],
      ['drivetrain', 'Tração', 'Ex: 4x2'],
      ['price', 'Preço', 'Ex: 189990'],
    ],
  },
  {
    title: 'Consumo e dimensões',
    fields: [
      ['consumption', 'Consumo', 'Ex: 12,4 km/l'],
      ['cityConsumption', 'Consumo urbano', 'Ex: 10,8'],
      ['highwayConsumption', 'Consumo estrada', 'Ex: 13,6'],
      ['length', 'Comprimento (mm)', 'Ex: 4800'],
      ['width', 'Largura (mm)', 'Ex: 1900'],
      ['height', 'Altura (mm)', 'Ex: 1700'],
      ['wheelbase', 'Entre-eixos (mm)', 'Ex: 2800'],
    ],
  },
  {
    title: 'Pneus e capacidades',
    fields: [
      ['tireType', 'Tipo de pneu', 'Ex: 235/55 R18'],
      ['rim', 'Aro', 'Ex: 18'],
      ['tireWidth', 'Largura do pneu (mm)', 'Ex: 235'],
      ['tireProfile', 'Perfil do pneu', 'Ex: 55'],
      ['tankCapacity', 'Tanque (L)', 'Ex: 60'],
      ['fuelType', 'Combustível', 'Ex: Gasolina'],
      ['loadCapacity', 'Carga (kg)', 'Ex: 450'],
      ['towingCapacity', 'Reboque (kg)', 'Ex: 1500'],
    ],
  },
];

export const FEATURE_GROUPS = [
  ['performance', 'Performance'],
  ['security', 'Segurança'],
  ['technology', 'Tecnologia'],
  ['comfort', 'Conforto'],
];

export function normalizeFeatureItems(value) {
  if (Array.isArray(value)) return value.filter(Boolean).map(String);
  return String(value || '').split(/\r?\n|,/).map((item) => item.trim()).filter(Boolean);
}

function normalizeKey(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

export function normalizeVehicle(source = {}) {
  const entries = Object.entries(source).reduce((result, [key, value]) => {
    result[normalizeKey(key)] = value;
    return result;
  }, {});

  const pick = (...keys) => keys.map(normalizeKey).map((key) => entries[key]).find((value) => value !== undefined && value !== '');

  return {
    brand: pick('brand', 'marca') || '',
    modelo: pick('modelo', 'model', 'nome', 'name') || '',
    ano: pick('ano', 'year') || '',
    segment: pick('segmento', 'categoria', 'tipo', 'segment', 'type') || '',
    engine: pick('motor', 'engine') || '',
    power: pick('potencia', 'power', 'cavalos', 'potencia_cv') || '',
    transmission: pick('transmissao', 'transmission', 'cambio') || '',
    price: pick('preco', 'price', 'valor') || '',
    consumption: pick('consumo', 'consumption') || '',
    cityConsumption: pick('consumocidade', 'cityconsumption', 'consumo_cidade_km_l') || '',
    highwayConsumption: pick('consumoestrada', 'highwayconsumption', 'consumo_estrada_km_l') || '',
    torque: pick('torque', 'torque_kgfm') || '',
    drivetrain: pick('tracao', 'drivetrain') || '',
    length: pick('comprimento', 'length', 'comprimento_mm') || '',
    width: pick('largura', 'width', 'largura_mm') || '',
    height: pick('altura', 'height', 'altura_mm') || '',
    wheelbase: pick('entreeixos', 'wheelbase', 'entre_eixos_mm') || '',
    tireType: pick('tipopneu', 'tiretype', 'pneu_tipo') || '',
    rim: pick('aro', 'rim', 'pneu_aro') || '',
    tireWidth: pick('largurapneu', 'tirewidth', 'pneu_largura_mm') || '',
    tireProfile: pick('perfilpneu', 'tireprofile', 'pneu_perfil_pct') || '',
    tankCapacity: pick('capacidadetanque', 'tankcapacity', 'capacidade_tanque_l') || '',
    fuelType: pick('tipocombustivel', 'fueltype', 'tipo_combustivel') || '',
    loadCapacity: pick('capacidadecarga', 'loadcapacity', 'capacidade_carga_kg') || '',
    towingCapacity: pick('capacidadereboque', 'towingcapacity', 'capacidade_reboque_kg') || '',
    performance: pick('performance', 'desempenho') || '',
    security: pick('seguranca', 'security', 'segurança') || '',
    technology: pick('tecnologia', 'technology', 'tecnologias') || '',
    comfort: pick('conforto', 'comfort') || '',
    description: pick('descricao', 'description') || '',
    image: pick('imagem', 'imagemurl', 'imagem_url', 'image', 'imageurl', 'foto') || null,
  };
}

export function parseCsv(text) {
  const header = text.split(/\r?\n/)[0];
  const delimiter = [';', '\t', ','].sort((a, b) => header.split(b).length - header.split(a).length)[0];
  const rows = [];
  let row = [], cell = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      if (quoted && text[i + 1] === '"') { cell += '"'; i++; }
      else quoted = !quoted;
    } else if (!quoted && (ch === delimiter || ch === '\n' || ch === '\r')) {
      row.push(cell.trim()); cell = '';
      if (ch !== delimiter) {
        if (row.some(Boolean)) rows.push(row);
        row = [];
        if (ch === '\r' && text[i + 1] === '\n') i++;
      }
    } else cell += ch;
  }
  if (quoted) throw new Error('CSV com aspas não fechadas.');
  row.push(cell.trim());
  if (row.some(Boolean)) rows.push(row);
  if (rows.length < 2) throw new Error('O CSV precisa de cabeçalhos e ao menos um veículo.');
  const [headers, ...values] = rows;
  return values.map(values => {
    if (values.length !== headers.length) throw new Error('Há linhas com número incorreto de colunas no CSV.');
    return Object.fromEntries(headers.map((key, i) => [key, values[i]]));
  });
}

export function parseVehicleFile(text, name) {
  const clean = text.replace(/^\uFEFF/, '').trim();
  if (!clean) throw new Error('O arquivo está vazio.');
  if (!/\.(json|csv)$/i.test(name)) throw new Error('Escolha um arquivo CSV ou JSON.');
  const parsed = /\.json$/i.test(name) ? JSON.parse(clean) : parseCsv(clean);
  const rows = Array.isArray(parsed) ? parsed : [parsed];
  if (!rows.length || rows.some(row => !row || typeof row !== 'object' || Array.isArray(row))) throw new Error('O arquivo deve conter uma ficha ou uma lista de veículos.');
  return rows.map(source => {
    const vehicle = normalizeVehicle(source);
    return Object.fromEntries(Object.entries(vehicle).map(([key, value]) => [key, value == null ? '' : Array.isArray(value) ? value.join('\n') : typeof value === 'object' ? '' : String(value)]));
  });
}

// Accepts values with units and Brazilian decimal/thousands separators.
export function toNumeric(value) {
  if (value === null || value === undefined || value === '') return null;
  let text = String(value).trim().replace(/\s/g, '');
  if (text.includes(',')) text = text.replace(/\./g, '').replace(',', '.');
  else if (/^-?\d{1,3}(\.\d{3})+(?:\D|$)/.test(text)) text = text.replace(/\./g, '');
  const match = text.match(/-?\d+(\.\d+)?/);
  return match ? match[0] : null;
}

// Monta o payload com as chaves canônicas que o backend já sabe mapear
// (mesmos aliases usados na importação de arquivo em massa).
export function buildImportPayload(vehicle) {
  if (!vehicle.brand.trim() || !vehicle.modelo.trim()) throw new Error('Informe pelo menos a marca e o modelo.');
  if (!/^\d{4}$/.test(String(vehicle.ano)) || Number(vehicle.ano) < 1900 || Number(vehicle.ano) > 2100) throw new Error('Informe um ano entre 1900 e 2100.');
  if (vehicle.image && !/^(https?:\/\/|data:image\/)/i.test(vehicle.image)) throw new Error('Use uma URL HTTP(S) ou envie uma imagem.');
  
  const payload = {
    marca: vehicle.brand,
    modelo: vehicle.modelo,
    ano: toNumeric(vehicle.ano) ?? vehicle.ano,
    imagem_url: vehicle.image,
    categoria: vehicle.segment,
    transmissao: vehicle.transmission,
    tracao: vehicle.drivetrain,
    tipo_combustivel: vehicle.fuelType,
    pneu_tipo: vehicle.tireType,
  };

  const numericFields = {
    preco: vehicle.price,
    potencia_cv: vehicle.power,
    torque_kgfm: vehicle.torque,
    consumo_cidade_km_l: vehicle.cityConsumption,
    consumo_estrada_km_l: vehicle.highwayConsumption,
    altura_mm: vehicle.height,
    largura_mm: vehicle.width,
    comprimento_mm: vehicle.length,
    entre_eixos_mm: vehicle.wheelbase,
    pneu_aro: vehicle.rim,
    pneu_largura_mm: vehicle.tireWidth,
    pneu_perfil_pct: vehicle.tireProfile,
    capacidade_tanque_l: vehicle.tankCapacity,
    capacidade_reboque_kg: vehicle.towingCapacity,
    capacidade_carga_kg: vehicle.loadCapacity,
  };

  for (const [key, rawValue] of Object.entries(numericFields)) {
    const numero = toNumeric(rawValue);
    if (String(rawValue ?? '').trim() && numero === null) throw new Error(`Informe um valor numérico para ${key}.`);
    if (numero !== null) payload[key] = numero;
  }

  // "engine", "consumption", "description", "image" e as 4 features (performance/
  // security/technology/comfort) não têm coluna correspondente no back hoje —
  // ficam de fora do payload de propósito.

  return payload;
}

