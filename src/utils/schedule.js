export const RECURRENCES = { once: 'Uma única vez', daily: 'Diariamente', weekly: 'Semanalmente', monthly: 'Mensalmente' };

export function validateSchedule({ car, date, time }, now = new Date()) {
  if (!car?.brand?.trim() || !(car.model || car.modelo || car.name)?.trim()) throw new Error('Selecione um veículo ou informe marca e modelo.');
  if (car.year && (!/^\d{4}$/.test(String(car.year)) || Number(car.year) < 1900 || Number(car.year) > 2100)) throw new Error('Informe um ano válido entre 1900 e 2100.');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) throw new Error('Informe a data no formato AAAA-MM-DD e a hora no formato HH:MM.');
  const [y, m, d] = date.split('-').map(Number);
  const [h, min] = time.split(':').map(Number);
  const scheduled = new Date(y, m - 1, d, h, min);
  if (scheduled.getFullYear() !== y || scheduled.getMonth() !== m - 1 || scheduled.getDate() !== d) throw new Error('Informe uma data existente.');
  if (scheduled <= now) throw new Error('Escolha uma data e hora no futuro.');
}

export function adaptSchedule(item) {
  const raw = item.proximaExecucao || item.dataAgendada || '';
  const custom = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})-(\d{2}:\d{2})/);
  const date = custom ? `${custom[3]}-${custom[2]}-${custom[1]}` : raw.split('T')[0];
  const time = custom ? custom[4] : (raw.split('T')[1] || '').slice(0, 5);
  return { ...item, date, time, recurrence: ({ Unica: 'once', Diaria: 'daily', Semanal: 'weekly', Mensal: 'monthly' })[item.recorrencia] || 'once' };
}
