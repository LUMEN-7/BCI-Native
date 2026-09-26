import apiFetch from './api';
const adapt = (team) => ({ id: team.id, name: team.nome, description: team.descricao || 'Workspace colaborativo do BCI.', members: team.totalMembros, inviteCode: team.codigoConvite, role: team.meuPapel === 'Administrador' ? 'owner' : 'member' });
export async function listTeams() { return (await apiFetch('/Equipe/minhas')).map(adapt); }
export async function createTeam(name, description) { return adapt(await apiFetch('/Equipe', { method: 'POST', body: JSON.stringify({ nome: name, descricao: description }) })); }
export async function joinTeam(code) { return adapt(await apiFetch('/Equipe/entrar', { method: 'POST', body: JSON.stringify({ codigo: code }) })); }
export async function getTeam(id) { return adapt(await apiFetch(`/Equipe/${id}`)); }
