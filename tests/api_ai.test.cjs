const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const babel = require('@babel/core');

function load(relative, stubs = {}) {
  const filename = path.resolve(__dirname, '..', relative);
  const { code } = babel.transformSync(fs.readFileSync(filename, 'utf8'), { filename, configFile: false, babelrc: false, plugins: ['@babel/plugin-transform-modules-commonjs'] });
  const module = { exports: {} };
  new Function('require', 'module', 'exports', code)(name => { if (Object.hasOwn(stubs, name)) return stubs[name]; throw new Error(`Unexpected dependency: ${name}`); }, module, module.exports);
  return module.exports;
}

test('AI URL requires explicit config and trims trailing slashes', () => {
  const ai = load('src/services/aiService.js');
  const previous = process.env.EXPO_PUBLIC_AI_SERVER_URL;
  try {
    delete process.env.EXPO_PUBLIC_AI_SERVER_URL;
    assert.throws(() => ai.getAiServerUrl(), { message: 'Servidor de IA não configurado.' });
    process.env.EXPO_PUBLIC_AI_SERVER_URL = 'https://bci-a105.onrender.com///';
    assert.equal(ai.getAiServerUrl(), 'https://bci-a105.onrender.com');
  } finally {
    if (previous === undefined) delete process.env.EXPO_PUBLIC_AI_SERVER_URL;
    else process.env.EXPO_PUBLIC_AI_SERVER_URL = previous;
  }
});

test('analyze uses the configured hosted AI server and expected endpoint', async () => {
  const ai = load('src/services/aiService.js');
  const previous = process.env.EXPO_PUBLIC_AI_SERVER_URL;
  const originalFetch = global.fetch;
  const calls = [];
  try {
    process.env.EXPO_PUBLIC_AI_SERVER_URL = 'https://bci-a105.onrender.com/';
    global.fetch = async (url, options) => {
      calls.push([url, JSON.parse(options.body)]);
      return { ok: true, json: async () => ({ descricao: 'Resumo', pontosFortes: ['A'], pontosFracos: ['B'], melhorUso: 'Cidade', concorrentesSemelhantes: ['C'] }) };
    };
    const result = await ai.analyzeVehicle({ marca: 'Ford', modelo: 'Territory', dados: { id: 4 } });
    assert.equal(calls[0][0], 'https://bci-a105.onrender.com/api/ai/analyze');
    assert.deepEqual(calls[0][1], { vehicle: { marca: 'Ford', modelo: 'Territory', dados: { id: 4 } } });
    assert.deepEqual(result, { description: 'Resumo', strengths: ['A'], weaknesses: ['B'], bestUse: 'Cidade', competitors: ['C'] });
  } finally {
    global.fetch = originalFetch;
    if (previous === undefined) delete process.env.EXPO_PUBLIC_AI_SERVER_URL;
    else process.env.EXPO_PUBLIC_AI_SERVER_URL = previous;
  }
});

test('enrichment posts only its missing field list to the hosted feature endpoint', async () => {
  const ai = load('src/services/aiService.js');
  const previous = process.env.EXPO_PUBLIC_AI_SERVER_URL;
  const originalFetch = global.fetch;
  let request;
  try {
    process.env.EXPO_PUBLIC_AI_SERVER_URL = 'https://bci-a105.onrender.com';
    global.fetch = async (url, options) => {
      request = [url, JSON.parse(options.body)];
      return { ok: true, json: async () => ({ specs: { torque: '20 kgfm' }, secoes: { seguranca: ['ABS'] } }) };
    };
    const result = await ai.enrichVehicle({ id: '5', specs: { power: { value: '150 cv', origin: 'api' } }, sections: {} }, ['torque']);
    assert.equal(request[0], 'https://bci-a105.onrender.com/api/ai/enrich-features');
    assert.deepEqual(request[1].missingFields, ['torque']);
    assert.equal(result.specs.torque, '20 kgfm');
    assert.deepEqual(result.sections.security, ['ABS']);
  } finally {
    global.fetch = originalFetch;
    if (previous === undefined) delete process.env.EXPO_PUBLIC_AI_SERVER_URL;
    else process.env.EXPO_PUBLIC_AI_SERVER_URL = previous;
  }
});

test('search and detail use the documented API endpoints', async () => {
  const calls = [];
  const services = load('src/services/carsService.js', {
    './api': { __esModule: true, default: async (url, options) => { calls.push([url, options]); return {}; }, apiFetchMultipart: async () => {} },
    'expo-file-system': { File: class {}, Paths: {} },
    'react-native': { Platform: { OS: 'android' } },
  });
  await services.startSearch({ brand: 'Ford' });
  await services.getJobStatus('job/1');
  await services.getCars();
  await services.getCar(27);
  assert.equal(calls[0][0], '/Pesquisa/busca');
  assert.equal(calls[0][1].method, 'POST');
  assert.equal(calls[1][0], '/Pesquisa/jobs/job%2F1');
  assert.equal(calls[2][0], '/Carro/listar?pagina=1&tamanhoPagina=50');
  assert.equal(calls[3][0], '/Carro/recente/27');
});

test('environment example has the hosted API and AI service URLs without keys', () => {
  const example = fs.readFileSync(path.resolve(__dirname, '..', '.env.example'), 'utf8');
  assert.match(example, /^EXPO_PUBLIC_API_BASE_URL=https:\/\/apiford\.onrender\.com$/m);
  assert.match(example, /^EXPO_PUBLIC_AI_SERVER_URL=https:\/\/bci-a105\.onrender\.com$/m);
  assert.doesNotMatch(example, /API_KEY|SECRET|TOKEN/i);
});

test('AI field labels identify estimates without displaying zero confidence', () => {
  const mainSpecs = fs.readFileSync(path.resolve(__dirname, '..', 'src/screens/VehicleDetailScreen/components/MainSpecs.js'), 'utf8');
  const evidence = fs.readFileSync(path.resolve(__dirname, '..', 'src/screens/VehicleDetailScreen/components/FieldEvidence.js'), 'utf8');
  assert.match(mainSpecs, /Estimado por IA/);
  assert.match(evidence, /Estimado por IA/);
  assert.doesNotMatch(`${mainSpecs}\n${evidence}`, /Estimado por IA[^\n]*0%|0% de confiança/i);
});
