import apiFetch from './api';

function toBlocks({ content, attachedCars = [] }) {
  const blocks = [];
  if (content?.trim()) blocks.push({ tipo: 'Paragrafo', texto: content.trim() });
  attachedCars.forEach((car) => { if (car?.id) blocks.push({ tipo: 'CardCarro', linhagemIdReferenciado: Number(car.id) }); });
  return blocks;
}
function fromBackend(note) {
  const blocks = note.blocos || [];
  const text = blocks.find((b) => b.tipo === 'Paragrafo')?.texto || '';
  const cars = blocks.filter((b) => b.tipo === 'CardCarro' && b.cardCarro).map((b) => ({
    id: b.cardCarro.linhagemId, brand: b.cardCarro.marca,
    name: `${b.cardCarro.marca} ${b.cardCarro.modelo} ${b.cardCarro.ano}`,
    image: b.cardCarro.imagemUrl || null,
  }));
  return { id: note.id, title: note.titulo, content: text, attachedCars: cars, createdAt: note.criadoEm, updatedAt: note.atualizadoEm };
}
export async function listNotes() { return (await apiFetch('/Anotacao/minhas')).map(fromBackend); }
export async function getNote(id) { return fromBackend(await apiFetch(`/Anotacao/${id}`)); }
export async function saveNote({ id, title, content, attachedCars }) {
  const noteId = id ?? (await apiFetch('/Anotacao', { method: 'POST', body: JSON.stringify({ titulo: title }) })).id;
  if (id) await apiFetch(`/Anotacao/${id}`, { method: 'PATCH', body: JSON.stringify({ titulo: title }) });
  await apiFetch(`/Anotacao/${noteId}/blocos`, { method: 'PUT', body: JSON.stringify({ blocos: toBlocks({ content, attachedCars }) }) });
  return getNote(noteId);
}
export function deleteNote(id) { return apiFetch(`/Anotacao/${id}`, { method: 'DELETE' }); }
