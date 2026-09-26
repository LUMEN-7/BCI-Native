const AI_SERVER_URL = process.env.EXPO_PUBLIC_AI_SERVER_URL || 'http://10.0.2.2:3001';
const AI_TIMEOUT_MS = 30000;

async function aiFetch(path, payload) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);
  try {
    const response = await fetch(`${AI_SERVER_URL}${path}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload), signal: controller.signal,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'Não foi possível concluir a análise da IA.');
    return data;
  } catch (error) {
    if (error.name === 'AbortError') throw new Error('A IA demorou muito para responder. Tente novamente.');
    throw error;
  } finally { clearTimeout(timeout); }
}

export async function analyzeVehicle(vehicle) {
  const data = await aiFetch('/api/ai/analyze', { vehicle });
  return {
    description: data.descricao || '',
    strengths: Array.isArray(data.pontosFortes) ? data.pontosFortes : [],
    weaknesses: Array.isArray(data.pontosFracos) ? data.pontosFracos : [],
    bestUse: data.melhorUso || '',
    competitors: Array.isArray(data.concorrentesSemelhantes) ? data.concorrentesSemelhantes : [],
  };
}

export async function analyzeComparison(firstCar, secondCar, mathConclusions = {}) {
  const data = await aiFetch('/api/ai/compare', { firstCar, secondCar, mathConclusions });
  return { summary: data.parecerIA || data.summary || '', recommendation: data.recomendacao || '', mathConclusions: data.conclusoesMatematicas || mathConclusions };
}

export async function enrichVehicle(vehicle, missingFields = []) {
  return aiFetch('/api/ai/enrich-features', { vehicle, missingFields });
}
