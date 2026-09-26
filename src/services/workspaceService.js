import apiFetch from './api';
const TYPE_TO_API = { update: 'Atualizacao', insight: 'Insight', review: 'Revisao', decision: 'Decisao', comparison: 'Comparacao' };
const TYPE_FROM_API = Object.fromEntries(Object.entries(TYPE_TO_API).map(([k,v]) => [v,k]));
export async function listPosts(teamId) {
  const posts = await apiFetch(`/Workspace/${teamId}/posts`);
  return posts.map((p) => ({ id: p.id, type: TYPE_FROM_API[p.tipo] || 'update', author: p.autor?.nome || 'Usuário', content: p.conteudo, tags: p.tags || [], pinned: p.fixado, liked: p.curtidoPeloUsuarioAtual, likes: p.totalCurtidas || 0, comments: p.comentarios || [] }));
}
export function createPost(teamId, { type='update', content, tags=[] }) { return apiFetch(`/Workspace/${teamId}/posts`, { method: 'POST', body: JSON.stringify({ tipo: TYPE_TO_API[type], conteudo: content, tags }) }); }
export function commentPost(postId, content) { return apiFetch(`/Workspace/posts/${postId}/comentarios`, { method: 'POST', body: JSON.stringify({ conteudo: content }) }); }
export function toggleLike(postId) { return apiFetch(`/Workspace/posts/${postId}/curtida`, { method: 'POST' }); }
export function togglePin(postId) { return apiFetch(`/Workspace/posts/${postId}/fixar`, { method: 'PATCH' }); }
export function deletePost(postId) { return apiFetch(`/Workspace/posts/${postId}`, { method: 'DELETE' }); }
