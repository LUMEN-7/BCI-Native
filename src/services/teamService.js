import apiFetch from './api';
import { pick } from '../utils/vehicleAdapters';
const adapt = team => ({
  id: pick(team, 'id'),
  name: pick(team, 'nome'),
  description: pick(team, 'descricao') || 'Workspace colaborativo do BCI.',
  members: pick(team, 'totalMembros'),
  inviteCode: pick(team, 'codigoConvite'),
  role: pick(team, 'meuPapel') === 'Administrador' ? 'owner' : 'member'
});
export async function listTeams() {
  return (await apiFetch('/Equipe/minhas')).map(adapt);
}
export async function createTeam(name, description) {
  return adapt(await apiFetch('/Equipe', {
    method: 'POST',
    body: JSON.stringify({
      nome: name,
      descricao: description
    })
  }));
}
export async function joinTeam(code) {
  return adapt(await apiFetch('/Equipe/entrar', {
    method: 'POST',
    body: JSON.stringify({
      codigo: code
    })
  }));
}
export async function getTeam(id) {
  return adapt(await apiFetch(`/Equipe/${id}`));
}
export async function listMembers(id) {
  return (await apiFetch('/Equipe/' + id + '/membros')).map(m => ({
    id: m.userId ?? m.UserId ?? m.id,
    name: m.nome ?? m.Nome ?? '',
    role: (m.papel ?? m.Papel) === 'Administrador' ? 'owner' : 'member'
  }));
}
