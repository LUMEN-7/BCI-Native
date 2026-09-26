import apiFetch from './api';
const TO_API = { once: 'Unica', daily: 'Diaria', weekly: 'Semanal', monthly: 'Mensal' };
const FROM_API = { Unica: 'once', Diaria: 'daily', Semanal: 'weekly', Mensal: 'monthly' };
export async function listSchedules() {
  const list = await apiFetch('/AgendamentoPesquisa/meus');
  return list.map((item) => ({ ...item, recurrence: FROM_API[item.recorrencia] || 'once' }));
}
export function saveSchedule({ car, date, time, recurrence, notes }) {
  const [year, month, day] = date.split('-');
  return apiFetch('/AgendamentoPesquisa', { method: 'POST', body: JSON.stringify({
    marca: car.brand, modelo: car.model || car.modelo || car.name, ano: car.year ? Number(car.year) : null,
    linhagemId: car.id ? Number(car.id) : null, dataAgendada: `${day}/${month}/${year}-${time}`,
    recorrencia: TO_API[recurrence] || 'Unica', notas: notes || null,
  }) });
}
export function deleteSchedule(id) { return apiFetch(`/AgendamentoPesquisa/${id}`, { method: 'DELETE' }); }
export function toggleSchedule(id) { return apiFetch(`/AgendamentoPesquisa/${id}/alternar-status`, { method: 'PATCH' }); }
export function runScheduleNow(id) { return apiFetch(`/AgendamentoPesquisa/${id}/executar-agora`, { method: 'POST' }); }
