import apiFetch from './api';
import { pick } from '../utils/vehicleAdapters';
export const POST_TYPES = {
  update: 'Atualização',
  insight: 'Insight',
  review: 'Revisão',
  decision: 'Decisão',
  comparison: 'Comparação'
};
export const STATUSES = {
  pending: 'Pendente',
  progress: 'Em análise',
  resolved: 'Resolvido'
};
export const LINK_TYPES = {
  research: 'Pesquisa',
  comparison: 'Comparação',
  aiAnalysis: 'Análise da IA',
  vehicle: 'Veículo'
};
const TYPE = {
  update: 'Atualizacao',
  insight: 'Insight',
  review: 'Revisao',
  decision: 'Decisao',
  comparison: 'Comparacao'
};
const STATUS = {
  pending: 'Pendente',
  progress: 'EmAnalise',
  resolved: 'Resolvido'
};
const LINK = {
  research: 'Pesquisa',
  comparison: 'Comparacao',
  aiAnalysis: 'AnaliseIA',
  vehicle: 'Veiculo'
};
const reverse = (map, value) => Object.keys(map).find(k => map[k] === value);
export function adaptComment(c) {
  const a = pick(c, 'autor');
  return {
    id: pick(c, 'id'),
    author: pick(a, 'nome') || 'Usuário',
    content: pick(c, 'conteudo') || '',
    date: pick(c, 'criadoEm')
  };
}
export function adaptPost(p) {
  const a = pick(p, 'autor'),
    r = pick(p, 'responsavel');
  return {
    id: pick(p, 'id'),
    type: reverse(TYPE, pick(p, 'tipo')) || 'update',
    author: pick(a, 'nome') || 'Usuário',
    authorId: pick(a, 'userId'),
    content: pick(p, 'conteudo') || '',
    tags: pick(p, 'tags') || [],
    pinned: pick(p, 'fixado') === true,
    liked: pick(p, 'curtidoPeloUsuarioAtual') === true,
    likes: pick(p, 'totalCurtidas') ?? 0,
    comments: (pick(p, 'comentarios') || []).map(adaptComment),
    date: pick(p, 'criadoEm'),
    responsible: pick(r, 'nome'),
    responsibleId: pick(r, 'userId'),
    status: reverse(STATUS, pick(p, 'status')),
    linkedType: reverse(LINK, pick(p, 'tipoConteudoVinculado')),
    linkedId: pick(p, 'conteudoVinculadoId'),
    linkedTitle: pick(p, 'conteudoVinculadoTitulo')
  };
}
export function postPayload({
  type = 'update',
  content,
  tags = [],
  responsibleId,
  status,
  linkedType,
  linkedId,
  linkedTitle
}) {
  return {
    tipo: TYPE[type],
    conteudo: content,
    tags,
    responsavelUserId: ['review', 'decision'].includes(type) ? responsibleId || null : null,
    status: ['review', 'decision'].includes(type) ? STATUS[status || 'pending'] : null,
    tipoConteudoVinculado: LINK[linkedType] || null,
    conteudoVinculadoId: linkedType && linkedType !== 'research' ? Number(linkedId) : null,
    conteudoVinculadoTitulo: linkedType ? linkedTitle : null
  };
}
export async function listPosts(teamId) {
  return (await apiFetch('/Workspace/' + teamId + '/posts')).map(adaptPost);
}
export async function createPost(teamId, form) {
  return adaptPost(await apiFetch('/Workspace/' + teamId + '/posts', {
    method: 'POST',
    body: JSON.stringify(postPayload(form))
  }));
}
export async function commentPost(id, content) {
  return adaptComment(await apiFetch('/Workspace/posts/' + id + '/comentarios', {
    method: 'POST',
    body: JSON.stringify({
      conteudo: content
    })
  }));
}
export function toggleLike(id) {
  return apiFetch('/Workspace/posts/' + id + '/curtida', {
    method: 'POST'
  });
}
export function togglePin(id) {
  return apiFetch('/Workspace/posts/' + id + '/fixar', {
    method: 'PATCH'
  });
}
export function updatePostStatus(id, status) {
  return apiFetch('/Workspace/posts/' + id + '/status', {
    method: 'PATCH',
    body: JSON.stringify({
      status: STATUS[status]
    })
  });
}
export function deletePost(id) {
  return apiFetch('/Workspace/posts/' + id, {
    method: 'DELETE'
  });
}
export async function listActivities(teamId) {
  return await apiFetch('/Workspace/' + teamId + '/atividades');
}
