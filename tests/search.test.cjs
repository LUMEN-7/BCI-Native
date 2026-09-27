const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const babel = require('@babel/core');

function load(relative, stubs = {}) {
  const filename = path.resolve(__dirname, '..', relative);
  const { code } = babel.transformSync(fs.readFileSync(filename, 'utf8'), {
    filename, configFile: false, babelrc: false,
    plugins: ['@babel/plugin-transform-modules-commonjs'],
  });
  const module = { exports: {} };
  new Function('require', 'module', 'exports', code)(name => {
    if (Object.hasOwn(stubs, name)) return stubs[name];
    if (name.startsWith('.')) return load(path.relative(path.resolve(__dirname, '..'), path.resolve(path.dirname(filename), `${name}.js`)), stubs);
    throw new Error(`Unexpected dependency: ${name}`);
  }, module, module.exports);
  return module.exports;
}
const imports = load('src/utils/vehicleImport.js');
const schedules = load('src/utils/schedule.js');
const { watchSearchJob } = load('src/utils/searchPolling.js');
const flush = () => new Promise(resolve => setImmediate(resolve));

test('polling retries connection errors, waits for a complete car and stops after completion', async () => {
  const responses = [new Error('offline'), { status: 'running' }, { status: 'done' }, { status: 'done', carro: { linhagemId: 7 } }];
  const callbacks = [], timers = [];
  let calls = 0;
  watchSearchJob({ jobId: 'job-1', getStatus: async id => {
    assert.equal(id, 'job-1'); calls++;
    const value = responses.shift(); if (value instanceof Error) throw value; return value;
  }, onConnectionError: e => callbacks.push(e.message), onComplete: car => callbacks.push(car.linhagemId), onFailure: () => assert.fail('unexpected failure'), schedule: callback => timers.push(callback), unschedule: () => {} });
  await flush();
  while (timers.length) { await timers.shift()(); await flush(); }
  assert.equal(calls, 4); assert.deepEqual(callbacks, ['offline', 7]);
});
test('polling has no overlapping requests and ignores an in-flight result after unmount', async () => {
  let resolveRequest, calls = 0, scheduled = false;
  const stop = watchSearchJob({ jobId: 'slow', getStatus: () => { calls++; return new Promise(resolve => { resolveRequest = resolve; }); },
    onComplete: () => assert.fail('late result'), onFailure: () => assert.fail('late failure'), onConnectionError: () => assert.fail('late error'),
    schedule: () => { scheduled = true; }, unschedule: () => {},
  });
  await flush(); assert.equal(calls, 1); assert.equal(scheduled, false);
  stop(); resolveRequest({ status: 'done', carro: { id: 1 } });
  await flush(); assert.equal(scheduled, false);
});
test('terminal job failure stops polling', async () => {
  let failed = false;
  watchSearchJob({ jobId: 'failed', getStatus: async () => ({ status: 'error' }), onComplete: () => assert.fail('unexpected completion'), onFailure: () => { failed = true; }, onConnectionError: () => {}, schedule: () => assert.fail('must stop'), unschedule: () => {} });
  await flush(); assert.equal(failed, true);
});

test('CSV preserves quoted delimiters, escaped quotes, multiline fields and decimal commas', () => {
  const rows = imports.parseVehicleFile('\uFEFFmarca;modelo;ano;preco;descricao\r\nFord;"Territory; Titanium";2026;"189.990,50";"Linha 1\nLinha ""2"""', 'car.csv');
  assert.equal(rows[0].modelo, 'Territory; Titanium');
  assert.equal(rows[0].description, 'Linha 1\nLinha "2"');
  assert.equal(imports.buildImportPayload(rows[0]).preco, '189990.50');
});
test('CSV comma and tab separators and multiple records', () => {
  for (const delimiter of [',', '\t']) {
    const rows = imports.parseVehicleFile(`marca${delimiter}modelo${delimiter}ano\nFord${delimiter}A${delimiter}2025\nFord${delimiter}B${delimiter}2026`, 'cars.csv');
    assert.equal(rows.length, 2);
    assert.equal(rows[1].modelo, 'B');
  }
});
test('JSON canonical aliases and feature arrays populate editable text', () => {
  const [car] = imports.parseVehicleFile(JSON.stringify({ marca: 'Ford', modelo: 'A', ano: 2026, potencia_cv: 169, imagem_url: 'https://example.com/a.jpg', seguranca: ['ABS', 'Airbags'] }), 'car.json');
  assert.equal(car.power, '169');
  assert.equal(car.image, 'https://example.com/a.jpg');
  assert.equal(car.security, 'ABS\nAirbags');
});
test('invalid or empty files fail instead of silently importing blank records', () => {
  for (const [text, name] of [['', 'a.csv'], ['marca,modelo', 'a.csv'], ['marca,modelo\n"Ford,A', 'a.csv'], ['marca,modelo\nFord,A,extra', 'a.csv'], ['[]', 'a.json'], ['null', 'a.json'], ['{', 'a.json'], ['true', 'a.json'], ['{}', 'a.txt']]) {
    assert.throws(() => imports.parseVehicleFile(text, name));
  }
});
test('canonical import payload validates identity and preserves supported units', () => {
  const payload = imports.buildImportPayload({ ...imports.EMPTY_VEHICLE, brand: 'Ford', modelo: 'A', ano: '2026', power: '169 cv', cityConsumption: '10,8 km/l', image: 'data:image/jpeg;base64,YQ==' });
  assert.equal(payload.potencia_cv, '169');
  assert.equal(payload.consumo_cidade_km_l, '10.8');
  assert.equal(payload.imagem_url, 'data:image/jpeg;base64,YQ==');
  assert.equal(Object.hasOwn(payload, 'engine'), false);
  assert.throws(() => imports.buildImportPayload({ ...imports.EMPTY_VEHICLE }));
  assert.throws(() => imports.buildImportPayload({ ...imports.EMPTY_VEHICLE, brand: 'Ford', modelo: 'A', ano: '20xx' }));
});
test('schedule validation rejects impossible dates, past times and invalid hours', () => {
  const car = { brand: 'Ford', model: 'A', year: '2028' };
  const now = new Date(2027, 0, 1);
  assert.doesNotThrow(() => schedules.validateSchedule({ car, date: '2028-02-29', time: '09:00' }, now));
  for (const [date, time] of [['2027-02-29', '09:00'], ['2028-04-31', '09:00'], ['2026-12-31', '09:00'], ['2028-12-31', '24:00'], ['2028-12-31', '09:60']]) {
    assert.throws(() => schedules.validateSchedule({ car, date, time }, now));
  }
});
test('schedule responses accept ISO and web date representations', () => {
  for (const proximaExecucao of ['2028-12-31T09:15:00', '31/12/2028-09:15']) {
    const item = schedules.adaptSchedule({ proximaExecucao, recorrencia: 'Semanal', status: 'Ativo' });
    assert.equal(item.date, '2028-12-31'); assert.equal(item.time, '09:15');
    assert.equal(item.recurrence, 'weekly'); assert.equal(item.status, 'Ativo');
  }
});
test('schedule service uses real endpoints and nullable lineage for unreleased vehicles', async () => {
  const calls = [];
  const service = load('src/services/scheduleService.js', { './api': async (...args) => { calls.push(args); return []; } });
  await service.saveSchedule({ car: { brand: 'Ford', model: 'A', year: '2099' }, date: '2099-12-31', time: '09:00', recurrence: 'daily', notes: 'preços' });
  const payload = JSON.parse(calls[0][1].body);
  assert.equal(payload.linhagemId, null); assert.equal(payload.recorrencia, 'Diaria');
  assert.equal(payload.dataAgendada, '31/12/2099-09:00');
  await service.listSchedules(); await service.toggleSchedule(7); await service.runScheduleNow(7); await service.deleteSchedule(7);
  assert.deepEqual(calls.map(([url, options]) => [url, options?.method || 'GET']), [
    ['/AgendamentoPesquisa', 'POST'], ['/AgendamentoPesquisa/meus', 'GET'],
    ['/AgendamentoPesquisa/7/alternar-status', 'PATCH'], ['/AgendamentoPesquisa/7/executar-agora', 'POST'], ['/AgendamentoPesquisa/7', 'DELETE'],
  ]);
});
test('native import sends a URI multipart part and cleans its temporary file on success and failure', async () => {
  const OriginalFormData = global.FormData;
  global.FormData = class { entries = []; append(...entry) { this.entries.push(entry); } };
  try {
    for (const fails of [false, true]) {
      let written, deleted = false, request;
      class File {
        uri = 'file:///cache/import.json'; exists = true;
        create() {} write(value) { written = value; } delete() { deleted = true; }
      }
      const service = load('src/services/carsService.js', {
        './api': { __esModule: true, default: () => {}, apiFetchMultipart: async (url, form) => { request = [url, form.entries]; if (fails) throw new Error('offline'); return { carro: { id: 1 } }; } },
        'expo-file-system': { File, Paths: { cache: 'file:///cache' } }, 'react-native': { Platform: { OS: 'android' } },
      });
      if (fails) await assert.rejects(service.importVehicle({ marca: 'Ford' }), /offline/);
      else assert.deepEqual(await service.importVehicle({ marca: 'Ford' }), { carro: { id: 1 } });
      assert.equal(written, '{"marca":"Ford"}'); assert.equal(deleted, true);
      assert.deepEqual(request, ['/Carro/importar-arquivo', [['arquivo', { uri: 'file:///cache/import.json', name: 'importacao-mobile.json', type: 'application/json' }]]]);
    }
  } finally { global.FormData = OriginalFormData; }
});
