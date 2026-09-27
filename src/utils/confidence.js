export function confidenceState(confidence, conflict = false) {
  const score = Math.max(0, Math.min(100, Number(confidence) || 0));
  const confirmed = score >= 80 && !conflict;
  return { confirmed, label: conflict ? 'Conflito' : score >= 80 ? 'Alta confiança' : score >= 60 ? 'Média confiança' : 'Baixa confiança', score };
}
