const AI_TIMEOUT_MS = 30000;

export function getAiServerUrl() {
  const configured = process.env.EXPO_PUBLIC_AI_SERVER_URL?.trim();
  if (!configured) throw new Error('Servidor de IA não configurado.');
  const url = configured.replace(/\/+$/, '');
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol) || !parsed.hostname) throw new Error();
  } catch { throw new Error('URL do servidor de IA inválida.'); }
  return url;
}

function devLog(label, detail) {
  if (typeof __DEV__ !== 'undefined' && __DEV__) console.log(`[BCI AI] ${label}`, detail);
}

async function aiFetch(path, payload) {
  const server = getAiServerUrl();
  devLog('server', server);
  devLog(path.endsWith('/analyze') ? 'analyze request' : path.endsWith('/enrich-features') ? 'enrich request' : 'compare request', { path });
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);
  try {
    const response = await fetch(`${server}${path}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload), signal: controller.signal,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'Não foi possível concluir a análise da IA.');
    devLog('response', { path, ok: true });
    return data;
  } catch (error) {
    if (error.name === 'AbortError') throw new Error('A IA demorou muito para responder. Tente novamente.');
    throw error;
  } finally { clearTimeout(timeout); }
}

export async function analyzeVehicle(vehicle) {
  const data = await aiFetch('/api/ai/analyze', { vehicle });
  const text = value => typeof value === 'string' ? value : '';
  const items = value => Array.isArray(value) ? value.filter(item => typeof item === 'string' && item.trim()) : [];
  return {
    description: text(data.descricao),
    strengths: items(data.pontosFortes),
    weaknesses: items(data.pontosFracos),
    bestUse: text(data.melhorUso),
    competitors: items(data.concorrentesSemelhantes),
  };
}

export async function analyzeComparison(firstCar, secondCar, mathConclusions = {}) {
  const data = await aiFetch('/api/ai/compare', { firstCar, secondCar, mathConclusions });
  return { summary: data.parecerIA || data.summary || '', recommendation: data.recomendacao || '', mathConclusions: data.conclusoesMatematicas || mathConclusions };
}

export async function enrichVehicle(vehicle, missingFields = []) {
  const data = await aiFetch('/api/ai/enrich-features', { vehicle, missingFields });
  return {
    specs: data.specs || {},
    sections: {
      performance: Array.isArray(data.secoes?.performance) ? data.secoes.performance : [],
      security: Array.isArray(data.secoes?.seguranca) ? data.secoes.seguranca : [],
      technology: Array.isArray(data.secoes?.tecnologia) ? data.secoes.tecnologia : [],
      comfort: Array.isArray(data.secoes?.conforto) ? data.secoes.conforto : [],
    },
  };
}
