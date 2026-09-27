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
const home = load('src/screens/HomeScreen/homeData.js');
test('home metrics preserve zero and do not invent counts from missing values', () => {
  assert.equal(home.formatMetric(0), '00'); assert.equal(home.formatMetric({ Quantidade: 7 }), '07');
  for (const value of [null, undefined, '', false, {}, -1, 1.5, 'unavailable']) assert.equal(home.formatMetric(value), '--');
});
test('saved coverage deduplicates lineage and uses only the users saved models', () => {
  const cars = home.savedModels({ FavoriteCarros: [{ LinhagemId: 1, Modelo: 'Teste', Categoria: { Valor: 'SUV' } }, { linhagemId: 1, categoria: 'SUV' }, { id: 2, categoria: 'suv' }, { id: 3 }, { Id: 4, Excluido: true }] });
  assert.equal(cars.length, 3);
  assert.deepEqual(home.savedCoverage(cars), [{ name: 'SUV', count: 2, percentage: 67 }, { name: 'Não informado', count: 1, percentage: 33 }]);
  assert.deepEqual(home.savedModels(null), []); assert.deepEqual(home.savedCoverage([]), []);
});
test('home monitoring reads lido/lida casing and never counts deleted or unknown-status alerts', () => {
  const items = home.unreadNotifications([{ id: 'old', lido: false, dataCriacao: '2026-01-01' }, { Id: 'new', Lida: false, DataCriacao: '2026-01-02' }, { lido: true }, { lido: false, excluido: true }, { titulo: 'unknown' }]);
  assert.equal(items.length, 2); assert.equal(items[0].Id, 'new');
});
test('recent comparisons sort by real saved dates and do not create fallback timestamps', () => {
  const items = home.recentComparisons([{ Id: 1, DataSalvamento: '2026-01-01' }, { id: 2, dataSalvamento: '2026-03-01' }, { id: 3 }, { id: 4, dataSalvamento: '2026-02-01' }]);
  assert.deepEqual(items.map(item => item.id || item.Id), [2, 4, 1]);
  assert.equal(home.activityDate('invalid'), ''); assert.equal(home.activityDate(null), '');
});
test('greeting matches web and supports mobile display-name aliases', () => {
  assert.equal(home.greeting(7), 'BOM DIA,'); assert.equal(home.greeting(12), 'BOA TARDE,'); assert.equal(home.greeting(18), 'BOA NOITE,');
  assert.equal(home.firstName({ NomeExibicao: ' Ana Maria ' }), 'Ana'); assert.equal(home.firstName(null), 'Usuário');
});
test('a failed metric does not hide successful home data, and blur ignores late results', async () => {
  let cells = [], cursor = 0, cleanup, focused;
  const react = {
    useState(initial) { const i = cursor++; if (!(i in cells)) cells[i] = initial; return [cells[i], value => { cells[i] = typeof value === 'function' ? value(cells[i]) : value; }]; },
    useCallback: fn => fn,
  };
  let finish;
  const hook = load('src/screens/HomeScreen/useHomeDashboard.js', {
    react, '@react-navigation/native': { useFocusEffect: fn => { if (!focused) { focused = true; cleanup = fn(); } } },
    '../../context/AuthContext': { useAuth: () => ({ user: { id: 1 } }) },
    '../../services/userService': { monitoredCount: async () => 0, savedComparisonsCount: async () => { throw new Error('offline'); }, comparisonsWeekCount: async () => 2, getFavorites: async () => [], getSavedComparisons: async () => [] },
    '../../services/notificationService': { activeNotificationsCount: async () => 3, listNotifications: () => new Promise(resolve => { finish = resolve; }) },
  }).default;
  const render = () => { cursor = 0; return hook(); };
  render(); await new Promise(resolve => setImmediate(resolve)); finish([]); await new Promise(resolve => setImmediate(resolve));
  const result = render(); assert.deepEqual(result.metrics.map(item => item.value), ['00', '--', '02', '03']); assert.deepEqual(result.alerts, []); assert.equal(result.loading, false); assert.deepEqual(result.errors, ['offline']);
  cleanup(); cells = []; focused = false; render(); await new Promise(resolve => setImmediate(resolve)); cleanup(); finish([{ lido: false }]); await new Promise(resolve => setImmediate(resolve));
  assert.equal(render().alerts, null);
});
