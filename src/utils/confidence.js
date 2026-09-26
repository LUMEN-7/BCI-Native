export function confidenceState(confidence, conflict = false) {
  const score = Number(confidence) || 0;
  const confirmed = score >= 70 && !conflict;
  return { confirmed, label: confirmed ? 'Confirmado' : 'Especulativo', score };
}
