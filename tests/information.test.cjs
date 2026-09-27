const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const babel = require('@babel/core');
function load(relative, stubs = {}) {
  const filename = path.resolve(__dirname, '..', relative);
  const { code } = babel.transformSync(fs.readFileSync(filename, 'utf8'), { filename, configFile: false, babelrc: false, plugins: ['@babel/plugin-transform-modules-commonjs'] });
  const module = { exports: {} };
  new Function('require', 'module', 'exports', code)(name => {
    if (Object.hasOwn(stubs, name)) return stubs[name];
    if (name.startsWith('.')) return load(path.relative(path.resolve(__dirname, '..'), path.resolve(path.dirname(filename), `${name}.js`)), stubs);
    throw new Error(`Unexpected dependency: ${name}`);
  }, module, module.exports);
  return module.exports;
}
const adapter = load('src/utils/vehicleAdapters.js');
const field = (value, confidence = 0.8, source = '7') => ({ Valor: value, Confianca: confidence, Fonte: source });
const dto = { Id: 90, LinhagemId: 5, Marca: 'Marca de teste', Modelo: 'Modelo de teste', Ano: 2025, Especificacoes: [{ Motor: { Fontes: [field('2.0')], Confianca: 0, Conflito: true }, Potencia: { Fontes: [field(150)], Confianca: 0.9 } }], Consumos: [{ Cidade: { Fontes: [field(10)] } }], Extras: [{ Seguranca: { Fontes: [field(['ABS', 'Airbags'])] } }], Fontes: [{ Id: 7, Nome: 'Fonte de teste', Url: 'https://example.com/specs' }] };
test('PascalCase DTO preserves lineage, zero confidence, conflicts and sources', () => {
  const car = adapter.adaptCarDetail(dto);
  assert.equal(car.id, '5'); assert.equal(car.specs.engine.value, '2.0');
  assert.equal(car.specs.engine.confidence, 0); assert.equal(car.specs.engine.conflict, true);
  assert.equal(car.specs.engine.origin, 'api');
  assert.equal(car.specs.power.value, '150 cv'); assert.equal(car.specs.cityConsumption.value, '10 km/l');
  assert.equal(car.specs.power.confidence, 90); assert.equal(car.sections.security.length, 2);
  assert.equal(car.averageConfidence, 57);
});
test('unknown values and explicit zero are never promoted to 100%', () => {
  assert.equal(adapter.unwrapField('2.0').confidence, 0);
  assert.equal(adapter.unwrapField({ Confianca: 0, Fontes: [field(0, 1)] }).confidence, 0);
  assert.equal(adapter.unwrapField({ Fontes: [field(0)] }).value, '0');
  assert.equal(adapter.unwrapField({ valor: '150 cv' }, ' cv').value, '150 cv');
  assert.equal(adapter.normalizeConfidence(85), 85);
  assert.equal(adapter.normalizeConfidence('invalid'), 0);
  assert.equal(adapter.adaptCarDetail(null), null);
  assert.equal(adapter.adaptCarDetail({ Id: 1, Excluido: true }), null);
});
test('local import only complements unsupported fields; server keeps persisted values', () => {
  const imported = { importForm: { engine: 'motor local', power: '999', cityConsumption: '500', description: 'Descrição local', technology: 'Item local', length: '99999' } };
  const car = adapter.adaptCarDetail(dto, imported);
  assert.equal(car.isImported, true); assert.equal(car.specs.power.value, '150 cv');
  assert.equal(car.specs.engine.value, '2.0'); assert.equal(car.specs.cityConsumption.value, '10 km/l');
  assert.equal(car.description, 'Descrição local'); assert.equal(car.sections.technology[0].origin, 'imported');
  assert.equal(car.specs.length.value, '99999'); assert.equal(car.specs.length.origin, 'imported');
  assert.equal(car.specs.length.confidence, 0); assert.equal(car.specs.length.source, null);
  assert.equal(car.specs.power.origin, 'api');
  const missing = adapter.adaptCarDetail({ Id: 1 }, imported);
  assert.equal(missing.specs.engine.value, 'motor local'); assert.equal(missing.specs.engine.confidence, 0); assert.equal(missing.specs.engine.source, null);
});
test('AI cannot overwrite real fields or attach invented source/confidence to enrichment', () => {
  const car = adapter.adaptCarDetail(dto);
  const enriched = adapter.applyEnrichment(car, { specs: { engine: 'invented', torque: { value: '20', confidence: 100, source: 'fake' }, type: 'not requested' }, sections: { security: ['invented'], comfort: [{ value: 'Estimate', source: 'fake', confidence: 100 }] } }, ['torque']);
  assert.equal(enriched.specs.engine.value, '2.0'); assert.equal(enriched.specs.type.value, 'Não informado');
  assert.equal(enriched.specs.torque.value, '20'); assert.equal(enriched.specs.torque.confidence, 0); assert.equal(enriched.specs.torque.source, null);
  assert.equal(enriched.sections.security[0].value, car.sections.security[0].value);
  assert.equal(enriched.sections.comfort[0].origin, 'ai'); assert.equal(enriched.sections.comfort[0].source, null);
});
test('source resolver uses actual catalogue and only opens valid HTTP(S) URLs', () => {
  assert.deepEqual(adapter.resolveSource('7', dto.Fontes), { name: 'Fonte de teste', url: 'https://example.com/specs' });
  for (const url of ['javascript:alert(1)', 'file:///private', 'https://user:pass@example.com', 'not a url']) assert.equal(adapter.safeSourceUrl(url), null);
  assert.equal(adapter.resolveSource('unknown').name, 'unknown');
  assert.equal(adapter.resolveSource(null), null);
});
test('conflicting field retains alternative values and their confidence', () => {
  const value = adapter.unwrapField({ Conflito: true, Confianca: 0.2, Fontes: [field(100, 0), field(150, 0.9, '8')] }, ' cv');
  assert.equal(value.alternatives.length, 2); assert.equal(value.alternatives[0].confidence, 0);
  assert.equal(value.alternatives[1].value, '150 cv');
});
function exportHarness({ failed = false, empty = false, available = true } = {}) {
  const calls = [], files = [];
  class File {
    constructor(...args) { this.uri = args.join('/'); files.push(this); }
    create() { this.exists = true; }
    write(bytes) { this.bytes = bytes; }
    delete() { this.exists = false; this.deleted = true; }
  }
  const module = load('src/services/exportService.js', {
    'expo-file-system': { File, Paths: { cache: 'cache' } },
    'expo-sharing': { isAvailableAsync: async () => available, shareAsync: async (...args) => { calls.push(['share', ...args]); if (failed) throw new Error('share failed'); } },
    './api': { apiRequest: async (...args) => { calls.push(['request', ...args]); return { headers: new Headers({ 'content-type': 'application/zip', 'content-disposition': 'attachment; filename="../../export.zip"' }), arrayBuffer: async () => new Uint8Array(empty ? [] : [0, 255, 128]).buffer }; } },
  });
  return { module, calls, files };
}
test('export uses real payload and keeps binary bytes/ZIP MIME available to the receiving app', async () => {
  const { module, calls, files } = exportHarness();
  await module.exportCar('5', 'csv', ';');
  assert.equal(calls[0][1], '/Exportacao'); assert.deepEqual(JSON.parse(calls[0][2].body), { itens: [{ linhagemId: 5 }], formato: 'csv', separador: ';' });
  assert.deepEqual([...files[0].bytes], [0, 255, 128]); assert.equal(files[0].exists, true);
  assert.equal(calls[1][2].mimeType, 'application/zip'); assert.ok(!files[0].uri.includes('..'));
});
test('non-CSV export omits separator and sharing failure cleans cache', async () => {
  const { module, calls, files } = exportHarness({ failed: true });
  await assert.rejects(module.exportCar(5, 'xlsx'), /share failed/);
  assert.equal(JSON.parse(calls[0][2].body).separador, undefined); assert.equal(files[0].deleted, true);
});
test('export rejects invalid identifiers, unavailable sharing and empty responses', async () => {
  const { module, calls } = exportHarness();
  await assert.rejects(module.exportCar('invalid'), /Identificador/); assert.equal(calls.length, 0);
  await assert.rejects(exportHarness({ available: false }).module.exportCar(5), /disponível/);
  await assert.rejects(exportHarness({ empty: true }).module.exportCar(5), /vazio/);
});
test('local delete is user-scoped and preserves other imported records', async () => {
  let written;
  const module = load('src/services/importedVehiclesStorage.js', { './storage': { getUserScopedJson: async (key, user) => { assert.equal(user.id, 8); return [{ id: '5' }, { id: '6' }]; }, setUserScopedJson: async (key, user, values) => { assert.equal(key, 'search.imported'); assert.equal(user.id, 8); written = values; } } });
  await module.removeImportedVehicle({ id: 8 }, 5); assert.deepEqual(written, [{ id: '6' }]);
});
test('favorite ID envelopes support both backend property cases', () => {
  const service = load('src/services/userService.js', { './api': {} });
  assert.deepEqual(service.getFavoriteIds({ FavoriteCarros: [{ LinhagemId: 5 }, { Id: 90 }] }), ['5', '90']);
});
test('authenticated binary requests retain session-expiry behavior', async () => {
  const originalFetch = global.fetch;
  let cleared = false, redirected = false, headers;
  global.fetch = async (url, options) => { headers = options.headers; return { status: 401, ok: false }; };
  try {
    const api = load('src/services/api.js', { './storage': { getAccessToken: async () => 'test-token', clearSession: async () => { cleared = true; } } });
    api.setUnauthorizedHandler(() => { redirected = true; });
    await assert.rejects(api.apiRequest('/Exportacao'), /Sessão expirada/);
    assert.equal(headers.Authorization, 'Bearer test-token'); assert.equal(cleared, true); assert.equal(redirected, true);
  } finally { global.fetch = originalFetch; }
});

function hookHarness(dependencies = {}) {
  let cursor = 0, pending = [], effects = [], cells = [], route = { params: { lineageId: '5' } };
  const user = { id: 8 };
  const calls = [];
  const react = {
    useState(initial) { const i = cursor++; if (!(i in cells)) cells[i] = typeof initial === 'function' ? initial() : initial; return [cells[i], value => { cells[i] = typeof value === 'function' ? value(cells[i]) : value; }]; },
    useRef(initial) { const i = cursor++; return cells[i] ||= { current: initial }; },
    useEffect(effect, deps) { const i = cursor++; if (!effects[i] || deps.some((value, k) => value !== effects[i].deps[k])) { pending.push(() => { effects[i]?.cleanup?.(); effects[i] = { deps, cleanup: effect() }; }); } },
  };
  const hook = load('src/screens/VehicleDetailScreen/useVehicleDetail.js', {
    react,
    '../../context/AuthContext': { useAuth: () => ({ user }) },
    '../../services/carsService': { getCar: async id => { calls.push(['getCar', id]); return dependencies.getCar ? dependencies.getCar(id) : dto; } },
    '../../services/userService': { getFavoriteIds: response => response.map(String), getFavorites: async () => [], addFavorite: async id => { calls.push(['addFavorite', id]); return dependencies.addFavorite?.(); }, removeFavorite: async id => calls.push(['removeFavorite', id]) },
    '../../services/importedVehiclesStorage': { getImportedVehicles: async () => dependencies.imported ? [{ id: '5', importForm: { description: 'Local' } }] : [], rememberImportedVehicle: async () => {}, removeImportedVehicle: async () => {} },
    '../../services/aiService': { analyzeVehicle: async payload => { calls.push(['analyze', payload]); return dependencies.analyze ? dependencies.analyze(payload) : { description: 'Descrição estimada', strengths: [], weaknesses: [], competitors: [], bestUse: '' }; }, enrichVehicle: async (car, missing) => { calls.push(['enrich', missing]); return { specs: { torque: '20' }, sections: {} }; } },
  }).default;
  const navigation = { navigate: (...args) => calls.push(['navigate', ...args]), setParams: params => { route = { params }; } };
  function render() { cursor = 0; const result = hook(route, navigation); const run = pending; pending = []; run.forEach(effect => effect()); return result; }
  return { render, calls, setId(id) { route = { params: { lineageId: id } }; }, unmount() { effects.forEach(effect => effect?.cleanup?.()); } };
}
const flush = () => new Promise(resolve => setImmediate(resolve));
test('detail loads the lineage, automatically analyzes normal vehicles and protects real specs', async () => {
  const harness = hookHarness();
  harness.render(); await flush(); const state = harness.render();
  assert.equal(state.car.id, '5'); assert.equal(state.loading, false);
  assert.equal(state.car.specs.power.value, '150 cv'); assert.equal(state.car.specs.torque.origin, 'ai');
  assert.equal(state.car.descriptionOrigin, 'ai'); assert.equal(harness.calls[0][1], '5');
  assert.equal(harness.calls.filter(call => call[0] === 'analyze').length, 1);
  harness.unmount();
});
test('imported detail requires an explicit AI action and guards duplicate favorite requests', async () => {
  let finish;
  const harness = hookHarness({ imported: true, addFavorite: () => new Promise(resolve => { finish = resolve; }) });
  harness.render(); await flush(); let state = harness.render();
  assert.equal(state.car.description, 'Local'); assert.equal(harness.calls.some(call => call[0] === 'analyze' || call[0] === 'enrich'), false);
  const save = state.toggleFavorite(); const duplicate = state.toggleFavorite();
  assert.equal(harness.render().saving, true); assert.equal(harness.calls.filter(call => call[0] === 'addFavorite').length, 1);
  finish(); await Promise.all([save, duplicate]); state = harness.render();
  assert.equal(state.favorite, true); assert.equal(state.notice, 'Pesquisa salva com sucesso.');
  await state.generateAnalysis(); assert.equal(harness.calls.filter(call => call[0] === 'analyze').length, 1);
  harness.unmount();
});
test('detail ignores a late vehicle response after navigating to another lineage', async () => {
  let finishOld;
  const harness = hookHarness({ imported: true, getCar: id => id === '5' ? new Promise(resolve => { finishOld = resolve; }) : { ...dto, LinhagemId: 6 } });
  harness.render(); harness.setId('6'); harness.render(); await flush();
  assert.equal(harness.render().car.id, '6');
  finishOld(dto); await flush(); assert.equal(harness.render().car.id, '6');
  harness.unmount();
});
test('detail distinguishes API failure and missing vehicle without blank state', async () => {
  const harness = hookHarness({ getCar: async () => { const error = new Error('missing'); error.status = 404; throw error; } });
  harness.render(); await flush(); assert.equal(harness.render().notFound, true); assert.equal(harness.render().loading, false); harness.unmount();
});
test('detail keeps API data visible when the separate AI analysis request fails', async () => {
  const harness = hookHarness({ analyze: async () => { throw new Error('Servidor de IA indisponível'); } });
  harness.render(); await flush(); const state = harness.render();
  assert.equal(state.car.specs.power.value, '150 cv');
  assert.equal(state.analysisError, 'Servidor de IA indisponível');
  assert.equal(state.loading, false);
  harness.unmount();
});
test('IA never receives model, brand or year as enrichable missing fields', async () => {
  const harness = hookHarness({ getCar: async () => ({ Id: 1, LinhagemId: 5 }) });
  harness.render(); await flush();
  const enrich = harness.calls.find(call => call[0] === 'enrich');
  assert.ok(enrich);
  assert.equal(enrich[1].includes('model'), false);
  assert.equal(enrich[1].includes('brand'), false);
  assert.equal(enrich[1].includes('year'), false);
  harness.unmount();
});
test('editing an import starts with current server values instead of stale local persisted fields', () => {
  const record = { importForm: { power: '999', engine: 'local', description: 'Descrição' } };
  const car = adapter.adaptCarDetail(dto, record);
  const edit = adapter.importedEditRecord(car, record);
  assert.equal(edit.importForm.power, '150 cv'); assert.equal(edit.importForm.engine, '2.0');
  assert.equal(edit.importForm.description, 'Descrição');
});
