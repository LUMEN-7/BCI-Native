import apiFetch from './api';
import { pick } from '../utils/vehicleAdapters';
const listeners = new Set();
export function subscribeNotes(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
const changed = () => listeners.forEach(listener => listener());
export function fromBackend(note) {
  const blocks = pick(note, 'blocos') || [];
  const text = blocks.filter(b => pick(b, 'tipo') === 'Paragrafo').map(b => pick(b, 'texto') || '').join('\n\n');
  const cars = blocks.filter(b => pick(b, 'tipo') === 'CardCarro').map(b => {
    const c = pick(b, 'cardCarro') || {};
    return {
      id: pick(c, 'linhagemId') ?? pick(b, 'linhagemIdReferenciado'),
      brand: pick(c, 'marca') || '',
      name: [pick(c, 'marca'), pick(c, 'modelo'), pick(c, 'ano')].filter(Boolean).join(' '),
      image: pick(c, 'imagemUrl') || null
    };
  }).filter(c => c.id != null);
  return {
    id: pick(note, 'id'),
    title: pick(note, 'titulo') || '',
    tag: pick(note, 'subtitulo') || '',
    content: text,
    attachedCars: cars,
    blocks,
    createdAt: pick(note, 'criadoEm'),
    updatedAt: pick(note, 'atualizadoEm')
  };
}
export function toBlocks({
  content,
  attachedCars = []
}, original) {
  const previous = original?.blocks || [];
  const result = [];
  let inserted = false;
  for (const b of previous) {
    const type = pick(b, 'tipo');
    if (type === 'Paragrafo') {
      if (content === original.content) result.push({
        id: pick(b, 'id'),
        tipo: type,
        texto: pick(b, 'texto')
      });else if (!inserted && content?.trim()) {
        result.push({
          tipo: 'Paragrafo',
          texto: content.trim()
        });
        inserted = true;
      }
    } else if (type !== 'CardCarro') {
      const comparison = pick(b, 'cardComparacao');
      result.push({
        id: pick(b, 'id'),
        tipo: type,
        texto: pick(b, 'texto'),
        comparacaoIdReferenciada: pick(b, 'comparacaoIdReferenciada') ?? pick(comparison, 'comparacaoId', 'id')
      });
    }
  }
  if (!previous.some(b => pick(b, 'tipo') === 'Paragrafo') && content?.trim()) result.unshift({
    tipo: 'Paragrafo',
    texto: content.trim()
  });
  attachedCars.forEach(car => {
    if (car?.id != null) result.push({
      tipo: 'CardCarro',
      linhagemIdReferenciado: Number(car.id)
    });
  });
  return result;
}
export async function listNotes() {
  const r = await apiFetch('/Anotacao/minhas');
  return (Array.isArray(r) ? r : pick(r, 'data', 'anotacoes') || []).map(fromBackend);
}
export async function getNote(id) {
  return fromBackend(await apiFetch('/Anotacao/' + id));
}
export async function saveNote({
  id,
  title,
  content,
  attachedCars
}) {
  const original = id != null ? await getNote(id) : null;
  const noteId = id ?? pick(await apiFetch('/Anotacao', {
    method: 'POST',
    body: JSON.stringify({
      titulo: title
    })
  }), 'id');
  try {
    if (id != null) await apiFetch('/Anotacao/' + id, {
      method: 'PATCH',
      body: JSON.stringify({
        titulo: title
      })
    });
    await apiFetch('/Anotacao/' + noteId + '/blocos', {
      method: 'PUT',
      body: JSON.stringify({
        blocos: toBlocks({
          content,
          attachedCars
        }, original)
      })
    });
    const result = await getNote(noteId);
    changed();
    return result;
  } catch (error) {
    error.noteId = noteId;
    changed();
    throw error;
  }
}
export async function deleteNote(id) {
  await apiFetch('/Anotacao/' + id, {
    method: 'DELETE'
  });
  changed();
}
